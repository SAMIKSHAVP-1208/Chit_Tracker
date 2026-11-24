# Sri Kumaran Chits

A chit fund management frontend and Supabase-ready data layer. The UI provides operational pages and empty states; it does not seed customer, chit, or payment records, and it does not implement auction calculations.

## Technologies

- React, TypeScript, Vite, Tailwind CSS, React Router, and Lucide React
- TanStack Query for data fetching
- React Hook Form and Zod for forms and validation
- Supabase Auth and PostgreSQL through `@supabase/supabase-js`
- Recharts and Decimal.js for later reporting and financial calculation work
- Vitest, jsdom, and React Testing Library
- ESLint

## Prerequisites and development

- Node.js 24 LTS or later
- npm

```sh
npm install
npm run dev
```

## Checks

```sh
npm test
npm run lint
npm run build
```

Use `npm run test:watch` to run Vitest in watch mode.

## Project structure

```text
public/
  images/                       Supplied Sri Kumaran Chits logo
src/
  components/
    layout/                     Application shell and navigation
    ui/                         Shared interface elements
  lib/                          Supabase client configuration
  pages/                        Dashboard and operational page layouts
  routes/                       React Router configuration
  services/                     Typed Supabase data services and error handling
  types/                        Database TypeScript types
supabase/
  migrations/                   PostgreSQL schema, constraints, and RLS
tests/
  integration/                  Route and navigation tests
  unit/                         Unit tests
```

## Supabase setup

The client is lazy-created by `src/lib/supabase.ts`. It reports a configuration error when a service is used without valid configuration, so the frontend can still run without connecting to a database.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings. Use a publishable/anon key only.
3. Install or run the Supabase CLI, authenticate, link the intended project, and review the pending migration before applying it:

   ```sh
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   `db push` applies local migrations to the linked project. Do not run it against a production project until the migration has been reviewed and the target has been confirmed.
4. Create/invite the initial Owner/Super Admin through Supabase Auth. Then, from the Supabase Dashboard SQL Editor, assign that existing Auth user the first owner profile:

   ```sql
   INSERT INTO public.user_profiles (user_id, role)
   SELECT id, 'owner'
   FROM auth.users
   WHERE lower(email) = lower('<owner-login-email>');
   ```

   The query should insert exactly one row. The Owner can then manage administrator roles through the protected `manage_admin_account` function.

The migration at `supabase/migrations/20261124112100_initial_schema.sql` creates the business settings, chit groups, customers, membership links, auctions, collection obligations and payment history, winner payouts and payout history, and user profiles. It adds foreign keys, numeric financial columns, unique/check constraints, safe archive/delete functions, and RLS policies limited to active authenticated Owner/Admin profiles. Payment ledgers are append-only; finalized auction snapshots are immutable. There are no public policies.

Never put a Supabase service-role key, database password, or other secret in a `VITE_` variable. Vite variables are available in browser code. `.env` and `.env.local` are ignored by Git; do not commit them.

## Business rules reserved for the calculation layer

The database stores the fixed 1.4% global interest rate and per-group owner commission (default ₹2,000); it does not calculate auction values. Normal-month and special second/final-month formulas are documented here for later work. Joint customers keep separate profiles but share one membership slot. Finalized calculation snapshots are protected from later edits.
