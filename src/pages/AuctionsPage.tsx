import { Gavel, Info } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'

const breakdownRows = [
  'Interest amount',
  'Discount',
  'After discount',
  'Monthly pay',
  'Owner commission',
  'Cash in hand',
]

export function AuctionsPage() {
  return (
    <>
      <PageHeader
        description="Choose a group and month to prepare an auction. Calculations and finalization are not enabled in this section."
        title="Monthly Auctions"
      />

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <SectionCard
          action={
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              No auction selected
            </span>
          }
          description="Auction details will be available after chit groups and members are connected."
          title="Auction details"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Chit group
              </span>
              <select
                aria-label="Select chit group"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-400"
                defaultValue=""
              >
                <option disabled value="">
                  Select a chit group
                </option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Auction month
              </span>
              <input
                aria-label="Select auction month"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-500"
                type="month"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Auction date
              </span>
              <input
                aria-label="Auction date"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-500"
                type="date"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Winning member
              </span>
              <select
                aria-label="Winning member"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-400"
                defaultValue=""
              >
                <option disabled value="">
                  Select a member
                </option>
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Auction sequence position
              </span>
              <input
                aria-label="Auction sequence position"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-500 sm:max-w-[calc(50%-0.5rem)]"
                min="1"
                placeholder="Month number"
                type="number"
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/70 p-4">
            <div className="flex items-start gap-3">
              <Info aria-hidden="true" className="mt-0.5 shrink-0 text-amber-700" size={17} />
              <div>
                <p className="text-xs font-semibold text-amber-900">Calculation rules are not active yet</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  The fixed 1.4% global interest rate, second-month and final-month rules, and
                  joint-slot handling will be applied in a later section. No amounts are
                  calculated here.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Finalized auction snapshots will be preserved when settings change.
            </p>
            <Button disabled icon={<Gavel aria-hidden="true" size={15} />} variant="primary">
              Finalize auction
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          description="Values will appear after the calculation engine is implemented."
          title="Calculation breakdown"
        >
          <div className="space-y-1">
            {breakdownRows.map((label, index) => (
              <div
                className={`flex items-center justify-between gap-4 rounded-lg px-3 py-3 ${
                  index === breakdownRows.length - 1
                    ? 'mt-2 border-t border-slate-200 bg-slate-50 font-semibold'
                    : ''
                }`}
                key={label}
              >
                <span className="text-xs text-slate-600">{label}</span>
                <span className="text-sm font-semibold text-slate-800">—</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <EmptyState
              compact
              description="Select a chit group with an auction record to see details."
              icon={Gavel}
              title="No auction selected"
            />
          </div>
        </SectionCard>
      </div>
    </>
  )
}
