CREATE TYPE public.app_role AS ENUM ('owner', 'admin');
CREATE TYPE public.chit_group_status AS ENUM (
  'upcoming',
  'active',
  'completed',
  'closed',
  'archived'
);
CREATE TYPE public.customer_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE public.membership_status AS ENUM (
  'active',
  'inactive',
  'withdrawn',
  'archived'
);
CREATE TYPE public.membership_customer_status AS ENUM ('active', 'removed');
CREATE TYPE public.auction_status AS ENUM ('scheduled', 'finalized', 'cancelled');
CREATE TYPE public.payment_status AS ENUM (
  'paid',
  'partially_paid',
  'pending',
  'overdue'
);
CREATE TYPE public.payment_method AS ENUM (
  'cash',
  'upi',
  'bank_transfer',
  'cheque',
  'other'
);

CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'admin',
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.business_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name text NOT NULL DEFAULT 'Sri Kumaran Chits'
    CHECK (length(btrim(business_name)) > 0),
  logo_url text,
  address text,
  contact_number text,
  email text,
  interest_rate numeric(5, 2) NOT NULL DEFAULT 1.40
    CHECK (interest_rate = 1.40),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chit_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chit_name text NOT NULL CHECK (length(btrim(chit_name)) > 0),
  chit_amount numeric(14, 2) NOT NULL CHECK (chit_amount > 0),
  duration_months integer NOT NULL CHECK (duration_months > 0),
  total_members integer NOT NULL CHECK (total_members > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_due_date date NOT NULL,
  auction_date date NOT NULL,
  owner_commission numeric(14, 2) NOT NULL DEFAULT 2000
    CHECK (owner_commission >= 0),
  status public.chit_group_status NOT NULL DEFAULT 'upcoming',
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chit_groups_date_range_check CHECK (end_date >= start_date)
);

CREATE UNIQUE INDEX chit_groups_name_ci_unique
  ON public.chit_groups (lower(btrim(chit_name)));

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (length(btrim(full_name)) > 0),
  mobile_number text NOT NULL
    CHECK (
      length(regexp_replace(mobile_number, '[^0-9]', '', 'g')) BETWEEN 7 AND 15
    ),
  email text CHECK (email IS NULL OR length(btrim(email)) > 0),
  address text,
  nominee_name text,
  nominee_relationship text,
  nominee_mobile_number text,
  status public.customer_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX customers_mobile_normalized_unique
  ON public.customers (regexp_replace(mobile_number, '[^0-9]', '', 'g'));
CREATE UNIQUE INDEX customers_email_ci_unique
  ON public.customers (lower(btrim(email)))
  WHERE email IS NOT NULL;

CREATE TABLE public.chit_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chit_group_id uuid NOT NULL
    REFERENCES public.chit_groups (id) ON DELETE RESTRICT,
  member_number integer NOT NULL CHECK (member_number > 0),
  membership_date date NOT NULL DEFAULT CURRENT_DATE,
  status public.membership_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chit_memberships_group_member_number_unique
    UNIQUE (chit_group_id, member_number),
  CONSTRAINT chit_memberships_id_group_unique UNIQUE (id, chit_group_id)
);

CREATE INDEX chit_memberships_customer_lookup_idx
  ON public.chit_memberships (chit_group_id, status);

CREATE TABLE public.membership_customers (
  membership_id uuid NOT NULL
    REFERENCES public.chit_memberships (id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL
    REFERENCES public.customers (id) ON DELETE RESTRICT,
  status public.membership_customer_status NOT NULL DEFAULT 'active',
  linked_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  PRIMARY KEY (membership_id, customer_id),
  CONSTRAINT membership_customers_removal_state_check CHECK (
    (status = 'active' AND removed_at IS NULL)
    OR (status = 'removed' AND removed_at IS NOT NULL)
  )
);

CREATE INDEX membership_customers_customer_idx
  ON public.membership_customers (customer_id, status);

CREATE TABLE public.monthly_auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chit_group_id uuid NOT NULL
    REFERENCES public.chit_groups (id) ON DELETE RESTRICT,
  month_number integer NOT NULL CHECK (month_number > 0),
  auction_date date NOT NULL,
  winning_membership_id uuid,
  auction_sequence_position integer NOT NULL
    CHECK (auction_sequence_position > 0),
  chit_amount numeric(14, 2) CHECK (chit_amount IS NULL OR chit_amount >= 0),
  interest_rate numeric(5, 2) NOT NULL DEFAULT 1.40
    CHECK (interest_rate = 1.40),
  total_members integer CHECK (total_members IS NULL OR total_members > 0),
  interest_amount numeric(14, 2)
    CHECK (interest_amount IS NULL OR interest_amount >= 0),
  discount numeric(14, 2) CHECK (discount IS NULL OR discount >= 0),
  after_discount_amount numeric(14, 2)
    CHECK (after_discount_amount IS NULL OR after_discount_amount >= 0),
  monthly_payment_amount numeric(14, 2)
    CHECK (monthly_payment_amount IS NULL OR monthly_payment_amount >= 0),
  owner_commission numeric(14, 2)
    CHECK (owner_commission IS NULL OR owner_commission >= 0),
  cash_in_hand numeric(14, 2)
    CHECK (cash_in_hand IS NULL OR cash_in_hand >= 0),
  auction_status public.auction_status NOT NULL DEFAULT 'scheduled',
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT monthly_auctions_group_month_unique
    UNIQUE (chit_group_id, month_number),
  CONSTRAINT monthly_auctions_group_sequence_unique
    UNIQUE (chit_group_id, auction_sequence_position),
  CONSTRAINT monthly_auctions_id_group_unique UNIQUE (id, chit_group_id),
  CONSTRAINT monthly_auctions_winner_group_fk
    FOREIGN KEY (winning_membership_id, chit_group_id)
    REFERENCES public.chit_memberships (id, chit_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT monthly_auctions_finalized_snapshot_check CHECK (
    auction_status <> 'finalized'
    OR (
      winning_membership_id IS NOT NULL
      AND chit_amount IS NOT NULL
      AND total_members IS NOT NULL
      AND interest_amount IS NOT NULL
      AND discount IS NOT NULL
      AND after_discount_amount IS NOT NULL
      AND monthly_payment_amount IS NOT NULL
      AND owner_commission IS NOT NULL
      AND cash_in_hand IS NOT NULL
      AND finalized_at IS NOT NULL
    )
  ),
  CONSTRAINT monthly_auctions_finalized_at_check CHECK (
    (auction_status = 'finalized' AND finalized_at IS NOT NULL)
    OR (auction_status <> 'finalized' AND finalized_at IS NULL)
  )
);

CREATE INDEX monthly_auctions_group_date_idx
  ON public.monthly_auctions (chit_group_id, auction_date);
CREATE INDEX monthly_auctions_winner_idx
  ON public.monthly_auctions (winning_membership_id)
  WHERE winning_membership_id IS NOT NULL;

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chit_group_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  auction_id uuid NOT NULL,
  expected_amount numeric(14, 2) NOT NULL CHECK (expected_amount > 0),
  amount_paid numeric(14, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  remaining_balance numeric(14, 2) NOT NULL CHECK (remaining_balance >= 0),
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_date date,
  payment_method public.payment_method,
  reference_number text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collections_group_membership_fk
    FOREIGN KEY (membership_id, chit_group_id)
    REFERENCES public.chit_memberships (id, chit_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT collections_group_auction_fk
    FOREIGN KEY (auction_id, chit_group_id)
    REFERENCES public.monthly_auctions (id, chit_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT collections_monthly_obligation_unique
    UNIQUE (chit_group_id, membership_id, auction_id),
  CONSTRAINT collections_balance_check
    CHECK (amount_paid + remaining_balance = expected_amount),
  CONSTRAINT collections_payment_status_check CHECK (
    (payment_status = 'paid' AND remaining_balance = 0)
    OR (
      payment_status = 'partially_paid'
      AND amount_paid > 0
      AND remaining_balance > 0
    )
    OR (payment_status = 'pending' AND amount_paid = 0 AND remaining_balance > 0)
    OR (payment_status = 'overdue' AND remaining_balance > 0)
  )
);

CREATE INDEX collections_group_auction_idx
  ON public.collections (chit_group_id, auction_id);
CREATE INDEX collections_membership_idx
  ON public.collections (membership_id, created_at DESC);

CREATE TABLE public.collection_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL
    REFERENCES public.collections (id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL,
  payment_method public.payment_method NOT NULL,
  reference_number text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX collection_payments_history_idx
  ON public.collection_payments (collection_id, payment_date DESC, created_at DESC);

CREATE TABLE public.winner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chit_group_id uuid NOT NULL,
  auction_id uuid NOT NULL,
  winning_membership_id uuid NOT NULL,
  calculated_payout numeric(14, 2) NOT NULL CHECK (calculated_payout >= 0),
  actual_amount_paid numeric(14, 2) NOT NULL DEFAULT 0
    CHECK (actual_amount_paid >= 0),
  remaining_balance numeric(14, 2) NOT NULL CHECK (remaining_balance >= 0),
  payout_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_date date,
  payment_method public.payment_method,
  reference_number text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT winner_payouts_group_auction_fk
    FOREIGN KEY (auction_id, chit_group_id)
    REFERENCES public.monthly_auctions (id, chit_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT winner_payouts_group_membership_fk
    FOREIGN KEY (winning_membership_id, chit_group_id)
    REFERENCES public.chit_memberships (id, chit_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT winner_payouts_auction_unique UNIQUE (auction_id),
  CONSTRAINT winner_payouts_balance_check
    CHECK (actual_amount_paid + remaining_balance = calculated_payout),
  CONSTRAINT winner_payouts_payment_status_check CHECK (
    (payout_status = 'paid' AND remaining_balance = 0)
    OR (
      payout_status = 'partially_paid'
      AND actual_amount_paid > 0
      AND remaining_balance > 0
    )
    OR (
      payout_status = 'pending'
      AND actual_amount_paid = 0
      AND remaining_balance > 0
    )
    OR (payout_status = 'overdue' AND remaining_balance > 0)
  )
);

CREATE INDEX winner_payouts_group_idx
  ON public.winner_payouts (chit_group_id, created_at DESC);
CREATE INDEX winner_payouts_membership_idx
  ON public.winner_payouts (winning_membership_id);

CREATE TABLE public.payout_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid NOT NULL
    REFERENCES public.winner_payouts (id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL,
  payment_method public.payment_method NOT NULL,
  reference_number text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payout_payments_history_idx
  ON public.payout_payments (payout_id, payment_date DESC, created_at DESC);

CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid())
      AND profile.is_active
      AND profile.role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_profiles_touch_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER business_settings_touch_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER chit_groups_touch_updated_at
  BEFORE UPDATE ON public.chit_groups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER customers_touch_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER monthly_auctions_touch_updated_at
  BEFORE UPDATE ON public.monthly_auctions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER collections_touch_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER winner_payouts_touch_updated_at
  BEFORE UPDATE ON public.winner_payouts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_membership_capacity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  group_capacity integer;
  group_status public.chit_group_status;
  existing_slots integer;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.chit_group_id = OLD.chit_group_id THEN
    RETURN NEW;
  END IF;

  SELECT chit_group.total_members, chit_group.status
  INTO group_capacity, group_status
  FROM public.chit_groups AS chit_group
  WHERE chit_group.id = NEW.chit_group_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chit group does not exist.';
  END IF;
  IF group_status IN ('completed', 'closed', 'archived') THEN
    RAISE EXCEPTION 'Memberships cannot be added to a closed chit group.';
  END IF;

  SELECT count(*)::integer
  INTO existing_slots
  FROM public.chit_memberships AS membership
  WHERE membership.chit_group_id = NEW.chit_group_id
    AND (TG_OP = 'INSERT' OR membership.id <> NEW.id);

  IF existing_slots >= group_capacity THEN
    RAISE EXCEPTION 'The chit group has reached its membership slot limit.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER chit_memberships_enforce_capacity
  BEFORE INSERT OR UPDATE ON public.chit_memberships
  FOR EACH ROW EXECUTE FUNCTION public.enforce_membership_capacity();

CREATE OR REPLACE FUNCTION public.enforce_group_slot_capacity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  assigned_slots integer;
BEGIN
  IF NEW.total_members < OLD.total_members THEN
    SELECT count(*)::integer
    INTO assigned_slots
    FROM public.chit_memberships AS membership
    WHERE membership.chit_group_id = OLD.id;

    IF NEW.total_members < assigned_slots THEN
      RAISE EXCEPTION 'Total membership slots cannot be less than already assigned slots.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER chit_groups_enforce_slot_capacity
  BEFORE UPDATE OF total_members ON public.chit_groups
  FOR EACH ROW EXECUTE FUNCTION public.enforce_group_slot_capacity();

CREATE OR REPLACE FUNCTION public.enforce_joint_membership_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  active_members integer;
BEGIN
  PERFORM 1
  FROM public.chit_memberships AS membership
  WHERE membership.id = NEW.membership_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership does not exist.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT count(*)::integer
    INTO active_members
    FROM public.membership_customers AS link
    WHERE link.membership_id = NEW.membership_id
      AND link.status = 'active'
      AND (link.membership_id, link.customer_id)
          <> (OLD.membership_id, OLD.customer_id);
  ELSE
    SELECT count(*)::integer
    INTO active_members
    FROM public.membership_customers AS link
    WHERE link.membership_id = NEW.membership_id
      AND link.status = 'active';
  END IF;

  IF NEW.status = 'active' AND active_members >= 2 THEN
    RAISE EXCEPTION 'A membership slot can be shared by no more than two customers.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER membership_customers_enforce_joint_limit
  BEFORE INSERT OR UPDATE ON public.membership_customers
  FOR EACH ROW EXECUTE FUNCTION public.enforce_joint_membership_limit();

CREATE OR REPLACE FUNCTION public.validate_auction_month()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  group_duration integer;
BEGIN
  SELECT chit_group.duration_months
  INTO group_duration
  FROM public.chit_groups AS chit_group
  WHERE chit_group.id = NEW.chit_group_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chit group does not exist.';
  END IF;
  IF NEW.month_number > group_duration
      OR NEW.auction_sequence_position > group_duration THEN
    RAISE EXCEPTION 'Auction month and sequence position must be within the chit duration.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER monthly_auctions_validate_month
  BEFORE INSERT OR UPDATE ON public.monthly_auctions
  FOR EACH ROW EXECUTE FUNCTION public.validate_auction_month();

CREATE OR REPLACE FUNCTION public.protect_finalized_auction()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.auction_status = 'finalized' THEN
      RAISE EXCEPTION 'Auctions cannot be finalized until the calculation engine is enabled.';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.auction_status = 'finalized' THEN
      RAISE EXCEPTION 'Finalized auction snapshots cannot be deleted.';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.auction_status = 'finalized' THEN
    RAISE EXCEPTION 'Finalized auction snapshots are immutable.';
  END IF;
  IF OLD.auction_status = 'cancelled' AND NEW.auction_status <> 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled auctions cannot be reopened.';
  END IF;

  IF NEW.auction_status = 'finalized' THEN
    RAISE EXCEPTION 'Auction finalization will be enabled with the calculation engine in a later section.';
  END IF;
  IF NEW.finalized_at IS NOT NULL THEN
    RAISE EXCEPTION 'Only finalized auctions may have a finalization date.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER monthly_auctions_protect_finalized
  BEFORE INSERT OR UPDATE OR DELETE ON public.monthly_auctions
  FOR EACH ROW EXECUTE FUNCTION public.protect_finalized_auction();

CREATE OR REPLACE FUNCTION public.prevent_payment_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Payment history is append-only and cannot be changed or deleted.';
END;
$$;

CREATE TRIGGER collection_payments_append_only
  BEFORE UPDATE OR DELETE ON public.collection_payments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_payment_history_mutation();
CREATE TRIGGER payout_payments_append_only
  BEFORE UPDATE OR DELETE ON public.payout_payments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_payment_history_mutation();

CREATE OR REPLACE FUNCTION public.apply_collection_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  outstanding numeric(14, 2);
BEGIN
  SELECT collection.remaining_balance
  INTO outstanding
  FROM public.collections AS collection
  WHERE collection.id = NEW.collection_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collection obligation does not exist.';
  END IF;
  IF NEW.amount > outstanding THEN
    RAISE EXCEPTION 'Payment amount cannot exceed the remaining balance.';
  END IF;

  UPDATE public.collections
  SET amount_paid = amount_paid + NEW.amount,
      remaining_balance = remaining_balance - NEW.amount,
      payment_status = CASE
        WHEN remaining_balance - NEW.amount = 0 THEN 'paid'::public.payment_status
        ELSE 'partially_paid'::public.payment_status
      END,
      payment_date = NEW.payment_date,
      payment_method = NEW.payment_method,
      reference_number = NEW.reference_number,
      remarks = COALESCE(NEW.remarks, remarks)
  WHERE id = NEW.collection_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER collection_payments_update_summary
  AFTER INSERT ON public.collection_payments
  FOR EACH ROW EXECUTE FUNCTION public.apply_collection_payment();

CREATE OR REPLACE FUNCTION public.apply_payout_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  outstanding numeric(14, 2);
BEGIN
  SELECT payout.remaining_balance
  INTO outstanding
  FROM public.winner_payouts AS payout
  WHERE payout.id = NEW.payout_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Winner payout does not exist.';
  END IF;
  IF NEW.amount > outstanding THEN
    RAISE EXCEPTION 'Payout amount cannot exceed the remaining balance.';
  END IF;

  UPDATE public.winner_payouts
  SET actual_amount_paid = actual_amount_paid + NEW.amount,
      remaining_balance = remaining_balance - NEW.amount,
      payout_status = CASE
        WHEN remaining_balance - NEW.amount = 0 THEN 'paid'::public.payment_status
        ELSE 'partially_paid'::public.payment_status
      END,
      payment_date = NEW.payment_date,
      payment_method = NEW.payment_method,
      reference_number = NEW.reference_number,
      remarks = COALESCE(NEW.remarks, remarks)
  WHERE id = NEW.payout_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payout_payments_update_summary
  AFTER INSERT ON public.payout_payments
  FOR EACH ROW EXECUTE FUNCTION public.apply_payout_payment();

CREATE OR REPLACE FUNCTION public.add_customer_to_membership(
  p_membership_id uuid,
  p_customer_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Administrator access is required.';
  END IF;

  INSERT INTO public.membership_customers (membership_id, customer_id, status, removed_at)
  VALUES (p_membership_id, p_customer_id, 'active', NULL)
  ON CONFLICT (membership_id, customer_id)
  DO UPDATE SET status = 'active', removed_at = NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_customer_from_membership(
  p_membership_id uuid,
  p_customer_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Administrator access is required.';
  END IF;

  UPDATE public.membership_customers
  SET status = 'removed', removed_at = pg_catalog.now()
  WHERE membership_id = p_membership_id
    AND customer_id = p_customer_id
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active customer membership was not found.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.archive_customer(p_customer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Administrator access is required.';
  END IF;

  UPDATE public.customers
  SET status = 'archived'
  WHERE id = p_customer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer was not found.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_customer_if_no_financial_history(
  p_customer_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affected_memberships uuid[];
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Administrator access is required.';
  END IF;

  PERFORM 1
  FROM public.customers AS customer
  WHERE customer.id = p_customer_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer was not found.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.membership_customers AS link
    WHERE link.customer_id = p_customer_id
      AND (
        EXISTS (
          SELECT 1 FROM public.collections AS collection
          WHERE collection.membership_id = link.membership_id
        )
        OR EXISTS (
          SELECT 1 FROM public.monthly_auctions AS auction
          WHERE auction.winning_membership_id = link.membership_id
        )
        OR EXISTS (
          SELECT 1 FROM public.winner_payouts AS payout
          WHERE payout.winning_membership_id = link.membership_id
        )
      )
  ) THEN
    RAISE EXCEPTION 'Customer has financial history and must be archived instead.';
  END IF;

  SELECT array_agg(link.membership_id)
  INTO affected_memberships
  FROM public.membership_customers AS link
  WHERE link.customer_id = p_customer_id;

  DELETE FROM public.membership_customers
  WHERE customer_id = p_customer_id;

  IF affected_memberships IS NOT NULL THEN
    DELETE FROM public.chit_memberships AS membership
    WHERE membership.id = ANY (affected_memberships)
      AND NOT EXISTS (
        SELECT 1
        FROM public.membership_customers AS link
        WHERE link.membership_id = membership.id
      );
  END IF;

  DELETE FROM public.customers WHERE id = p_customer_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.archive_chit_group(p_chit_group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Administrator access is required.';
  END IF;

  UPDATE public.chit_groups
  SET status = 'archived'
  WHERE id = p_chit_group_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chit group was not found.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_chit_group_if_no_financial_history(
  p_chit_group_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Administrator access is required.';
  END IF;

  PERFORM 1
  FROM public.chit_groups AS chit_group
  WHERE chit_group.id = p_chit_group_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chit group was not found.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.monthly_auctions
    WHERE chit_group_id = p_chit_group_id
  ) OR EXISTS (
    SELECT 1 FROM public.collections
    WHERE chit_group_id = p_chit_group_id
  ) OR EXISTS (
    SELECT 1 FROM public.winner_payouts
    WHERE chit_group_id = p_chit_group_id
  ) THEN
    RAISE EXCEPTION 'Chit group has financial history and must be archived instead.';
  END IF;

  DELETE FROM public.membership_customers AS link
  USING public.chit_memberships AS membership
  WHERE link.membership_id = membership.id
    AND membership.chit_group_id = p_chit_group_id;
  DELETE FROM public.chit_memberships
  WHERE chit_group_id = p_chit_group_id;
  DELETE FROM public.chit_groups
  WHERE id = p_chit_group_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.manage_admin_account(
  p_user_id uuid,
  p_role public.app_role,
  p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_role public.app_role;
  current_is_active boolean;
  active_owner_count integer;
BEGIN
  LOCK TABLE public.user_profiles IN EXCLUSIVE MODE;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_profiles AS caller
    WHERE caller.user_id = (SELECT auth.uid())
      AND caller.role = 'owner'
      AND caller.is_active
  ) THEN
    RAISE EXCEPTION 'Only an active owner can manage administrator accounts.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'The Supabase Auth user was not found.';
  END IF;

  SELECT role, is_active
  INTO current_role, current_is_active
  FROM public.user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_role = 'owner'
      AND current_is_active
      AND (p_role <> 'owner' OR NOT p_is_active) THEN
    SELECT count(*)::integer
    INTO active_owner_count
    FROM public.user_profiles
    WHERE role = 'owner' AND is_active;

    IF active_owner_count <= 1 THEN
      RAISE EXCEPTION 'The last active owner cannot be deactivated or demoted.';
    END IF;
  END IF;

  INSERT INTO public.user_profiles (user_id, role, is_active)
  VALUES (p_user_id, p_role, p_is_active)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;
END;
$$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_payments ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO authenticated;

CREATE POLICY user_profiles_read
  ON public.user_profiles FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_authorized_admin());

CREATE POLICY business_settings_admin_access
  ON public.business_settings FOR ALL TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY chit_groups_admin_access
  ON public.chit_groups FOR ALL TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY customers_admin_access
  ON public.customers FOR ALL TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY chit_memberships_admin_access
  ON public.chit_memberships FOR ALL TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY membership_customers_admin_select
  ON public.membership_customers FOR SELECT TO authenticated
  USING (public.is_authorized_admin());
CREATE POLICY membership_customers_admin_insert
  ON public.membership_customers FOR INSERT TO authenticated
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY monthly_auctions_admin_access
  ON public.monthly_auctions FOR ALL TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY collections_admin_select
  ON public.collections FOR SELECT TO authenticated
  USING (public.is_authorized_admin());
CREATE POLICY collections_admin_insert
  ON public.collections FOR INSERT TO authenticated
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY collections_admin_update_status
  ON public.collections FOR UPDATE TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY collection_payments_admin_select
  ON public.collection_payments FOR SELECT TO authenticated
  USING (public.is_authorized_admin());
CREATE POLICY collection_payments_admin_insert
  ON public.collection_payments FOR INSERT TO authenticated
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY winner_payouts_admin_select
  ON public.winner_payouts FOR SELECT TO authenticated
  USING (public.is_authorized_admin());
CREATE POLICY winner_payouts_admin_insert
  ON public.winner_payouts FOR INSERT TO authenticated
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY winner_payouts_admin_update_status
  ON public.winner_payouts FOR UPDATE TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());
CREATE POLICY payout_payments_admin_select
  ON public.payout_payments FOR SELECT TO authenticated
  USING (public.is_authorized_admin());
CREATE POLICY payout_payments_admin_insert
  ON public.payout_payments FOR INSERT TO authenticated
  WITH CHECK (public.is_authorized_admin());

REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.business_settings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.chit_groups FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.customers FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.chit_memberships FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.membership_customers FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.monthly_auctions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.collections FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.collection_payments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.winner_payouts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.payout_payments FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.business_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chit_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chit_memberships TO authenticated;
GRANT SELECT, INSERT ON public.membership_customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.monthly_auctions TO authenticated;
GRANT SELECT, INSERT ON public.collections TO authenticated;
GRANT UPDATE (payment_status) ON public.collections TO authenticated;
GRANT SELECT, INSERT ON public.collection_payments TO authenticated;
GRANT SELECT, INSERT ON public.winner_payouts TO authenticated;
GRANT UPDATE (payout_status) ON public.winner_payouts TO authenticated;
GRANT SELECT, INSERT ON public.payout_payments TO authenticated;

REVOKE ALL ON FUNCTION public.is_authorized_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_membership_capacity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_group_slot_capacity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_joint_membership_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_auction_month() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_finalized_auction() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_payment_history_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_collection_payment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_payout_payment() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.add_customer_to_membership(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_customer_from_membership(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.archive_customer(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_customer_if_no_financial_history(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.archive_chit_group(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_chit_group_if_no_financial_history(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.manage_admin_account(uuid, public.app_role, boolean) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.add_customer_to_membership(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_customer_from_membership(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_customer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_customer_if_no_financial_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_chit_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_chit_group_if_no_financial_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.manage_admin_account(uuid, public.app_role, boolean) TO authenticated;
