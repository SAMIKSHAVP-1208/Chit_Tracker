export type AppRole = 'owner' | 'admin'
export type ChitGroupStatus =
  | 'upcoming'
  | 'active'
  | 'completed'
  | 'closed'
  | 'archived'
export type CustomerStatus = 'active' | 'inactive' | 'archived'
export type MembershipStatus = 'active' | 'inactive' | 'withdrawn' | 'archived'
export type MembershipCustomerStatus = 'active' | 'removed'
export type AuctionStatus = 'scheduled' | 'finalized' | 'cancelled'
export type PaymentStatus = 'paid' | 'partially_paid' | 'pending' | 'overdue'
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other'

type TableDefinition<Row, Insert, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type BusinessSettingsRow = {
  id: number
  business_name: string
  logo_url: string | null
  address: string | null
  contact_number: string | null
  email: string | null
  interest_rate: number
  created_at: string
  updated_at: string
}

type UserProfileRow = {
  user_id: string
  role: AppRole
  display_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type ChitGroupRow = {
  id: string
  chit_name: string
  chit_amount: number
  duration_months: number
  total_members: number
  start_date: string
  end_date: string
  monthly_due_date: string
  auction_date: string
  owner_commission: number
  status: ChitGroupStatus
  remarks: string | null
  created_at: string
  updated_at: string
}

type CustomerRow = {
  id: string
  full_name: string
  mobile_number: string
  email: string | null
  address: string | null
  nominee_name: string | null
  nominee_relationship: string | null
  nominee_mobile_number: string | null
  status: CustomerStatus
  created_at: string
  updated_at: string
}

type ChitMembershipRow = {
  id: string
  chit_group_id: string
  member_number: number
  membership_date: string
  status: MembershipStatus
  created_at: string
}

type MembershipCustomerRow = {
  membership_id: string
  customer_id: string
  status: MembershipCustomerStatus
  linked_at: string
  removed_at: string | null
}

type MonthlyAuctionRow = {
  id: string
  chit_group_id: string
  month_number: number
  auction_date: string
  winning_membership_id: string | null
  auction_sequence_position: number
  chit_amount: number | null
  interest_rate: number
  total_members: number | null
  interest_amount: number | null
  discount: number | null
  after_discount_amount: number | null
  monthly_payment_amount: number | null
  owner_commission: number | null
  cash_in_hand: number | null
  auction_status: AuctionStatus
  finalized_at: string | null
  created_at: string
  updated_at: string
}

type CollectionRow = {
  id: string
  chit_group_id: string
  membership_id: string
  auction_id: string
  expected_amount: number
  amount_paid: number
  remaining_balance: number
  payment_status: PaymentStatus
  payment_date: string | null
  payment_method: PaymentMethod | null
  reference_number: string | null
  remarks: string | null
  created_at: string
  updated_at: string
}

type CollectionPaymentRow = {
  id: string
  collection_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number: string | null
  remarks: string | null
  created_at: string
}

type WinnerPayoutRow = {
  id: string
  chit_group_id: string
  auction_id: string
  winning_membership_id: string
  calculated_payout: number
  actual_amount_paid: number
  remaining_balance: number
  payout_status: PaymentStatus
  payment_date: string | null
  payment_method: PaymentMethod | null
  reference_number: string | null
  remarks: string | null
  created_at: string
  updated_at: string
}

type PayoutPaymentRow = {
  id: string
  payout_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number: string | null
  remarks: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      user_profiles: TableDefinition<
        UserProfileRow,
        {
          user_id: string
          role?: AppRole
          display_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      >
      business_settings: TableDefinition<
        BusinessSettingsRow,
        {
          id?: number
          business_name?: string
          logo_url?: string | null
          address?: string | null
          contact_number?: string | null
          email?: string | null
          interest_rate?: number
          created_at?: string
          updated_at?: string
        }
      >
      chit_groups: TableDefinition<
        ChitGroupRow,
        {
          id?: string
          chit_name: string
          chit_amount: number
          duration_months: number
          total_members: number
          start_date: string
          end_date: string
          monthly_due_date: string
          auction_date: string
          owner_commission?: number
          status?: ChitGroupStatus
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      customers: TableDefinition<
        CustomerRow,
        {
          id?: string
          full_name: string
          mobile_number: string
          email?: string | null
          address?: string | null
          nominee_name?: string | null
          nominee_relationship?: string | null
          nominee_mobile_number?: string | null
          status?: CustomerStatus
          created_at?: string
          updated_at?: string
        }
      >
      chit_memberships: TableDefinition<
        ChitMembershipRow,
        {
          id?: string
          chit_group_id: string
          member_number: number
          membership_date?: string
          status?: MembershipStatus
          created_at?: string
        }
      >
      membership_customers: TableDefinition<
        MembershipCustomerRow,
        {
          membership_id: string
          customer_id: string
          status?: MembershipCustomerStatus
          linked_at?: string
          removed_at?: string | null
        }
      >
      monthly_auctions: TableDefinition<
        MonthlyAuctionRow,
        {
          id?: string
          chit_group_id: string
          month_number: number
          auction_date: string
          winning_membership_id?: string | null
          auction_sequence_position: number
          chit_amount?: number | null
          interest_rate?: number
          total_members?: number | null
          interest_amount?: number | null
          discount?: number | null
          after_discount_amount?: number | null
          monthly_payment_amount?: number | null
          owner_commission?: number | null
          cash_in_hand?: number | null
          auction_status?: AuctionStatus
          finalized_at?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      collections: TableDefinition<
        CollectionRow,
        {
          id?: string
          chit_group_id: string
          membership_id: string
          auction_id: string
          expected_amount: number
          amount_paid?: number
          remaining_balance: number
          payment_status?: PaymentStatus
          payment_date?: string | null
          payment_method?: PaymentMethod | null
          reference_number?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      collection_payments: TableDefinition<
        CollectionPaymentRow,
        {
          id?: string
          collection_id: string
          amount: number
          payment_date: string
          payment_method: PaymentMethod
          reference_number?: string | null
          remarks?: string | null
          created_at?: string
        }
      >
      winner_payouts: TableDefinition<
        WinnerPayoutRow,
        {
          id?: string
          chit_group_id: string
          auction_id: string
          winning_membership_id: string
          calculated_payout: number
          actual_amount_paid?: number
          remaining_balance: number
          payout_status?: PaymentStatus
          payment_date?: string | null
          payment_method?: PaymentMethod | null
          reference_number?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      payout_payments: TableDefinition<
        PayoutPaymentRow,
        {
          id?: string
          payout_id: string
          amount: number
          payment_date: string
          payment_method: PaymentMethod
          reference_number?: string | null
          remarks?: string | null
          created_at?: string
        }
      >
    }
    Views: { [_ in never]: never }
    Functions: {
      is_authorized_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      add_customer_to_membership: {
        Args: { p_membership_id: string; p_customer_id: string }
        Returns: undefined
      }
      remove_customer_from_membership: {
        Args: { p_membership_id: string; p_customer_id: string }
        Returns: undefined
      }
      archive_customer: {
        Args: { p_customer_id: string }
        Returns: undefined
      }
      delete_customer_if_no_financial_history: {
        Args: { p_customer_id: string }
        Returns: undefined
      }
      archive_chit_group: {
        Args: { p_chit_group_id: string }
        Returns: undefined
      }
      delete_chit_group_if_no_financial_history: {
        Args: { p_chit_group_id: string }
        Returns: undefined
      }
      manage_admin_account: {
        Args: {
          p_user_id: string
          p_role: AppRole
          p_is_active: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: AppRole
      chit_group_status: ChitGroupStatus
      customer_status: CustomerStatus
      membership_status: MembershipStatus
      membership_customer_status: MembershipCustomerStatus
      auction_status: AuctionStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type DatabaseTables = Database['public']['Tables']
