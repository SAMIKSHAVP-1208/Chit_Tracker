import { useState } from 'react'
import {
  Banknote,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Search,
  Trophy,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { StatusBadge } from '../components/ui/StatusBadge'

type PaymentTab = 'collections' | 'payouts'

function PaymentEntryPreview({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      description="Record a full or partial member payment for a chit group."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Payment recording will be enabled after secure storage is connected.
          </p>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button disabled variant="primary">
              Record payment
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
      title="Record payment"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Chit group
          </span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <option>Select a chit group</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Member
          </span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <option>Select a member</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Month
          </span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <option>Select a month</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Payment amount
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            min="0"
            placeholder="₹"
            type="number"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Payment date
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-500"
            type="date"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Payment type
          </span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600">
            <option>Full payment</option>
            <option>Partial payment</option>
          </select>
        </label>
      </div>
    </Modal>
  )
}

export function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<PaymentTab>('collections')
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const showRecordDialog = searchParams.get('record') === '1'

  function closeRecordDialog() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('record')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <>
      <PageHeader
        actions={
          <Button
            icon={<Banknote aria-hidden="true" size={16} />}
            onClick={() => setSearchParams({ record: '1' })}
            variant="primary"
          >
            Record payment
          </Button>
        }
        description="Review monthly dues, record member payments, and track winner payouts separately."
        title="Collections & Payments"
      />

      <div
        aria-label="Collections and payout views"
        className="mb-5 inline-flex rounded-xl bg-slate-100 p-1"
        role="tablist"
      >
        <button
          aria-selected={activeTab === 'collections'}
          className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${
            activeTab === 'collections'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('collections')}
          role="tab"
          type="button"
        >
          Collections
        </button>
        <button
          aria-selected={activeTab === 'payouts'}
          className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${
            activeTab === 'payouts'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('payouts')}
          role="tab"
          type="button"
        >
          Winner payouts
        </button>
      </div>

      {activeTab === 'collections' ? (
        <SectionCard
          description="Full and partial payments will be shown against each member's monthly due."
          title="Monthly collections"
        >
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(160px,1fr)_160px_minmax(180px,1fr)_180px]">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Chit group
              </span>
              <select
                aria-label="Select chit group"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500"
              >
                <option>All chit groups</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Month
              </span>
              <input
                aria-label="Select collection month"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500"
                type="month"
              />
            </label>
            <label className="relative self-end">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                aria-label="Search member name"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Search member"
                value={search}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Payment status
              </span>
              <select
                aria-label="Filter by payment status"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"
              >
                <option>All statuses</option>
                <option>Paid</option>
                <option>Partially Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </label>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-medium text-slate-500">
              Payment status
            </span>
            {(['Paid', 'Partially Paid', 'Pending', 'Overdue'] as const).map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.9fr_0.8fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold tracking-[0.07em] text-slate-500 uppercase">
                <span>Member</span>
                <span>Chit name</span>
                <span>Monthly amount</span>
                <span>Pending balance</span>
                <span>Payment date</span>
                <span>Status</span>
              </div>
              <EmptyState
                description={
                  search
                    ? `No payment records match “${search}”.`
                    : 'Choose a chit group and month to view member dues. No payment records are available yet.'
                }
                icon={CreditCard}
                title={search ? 'No matching payment records' : 'No collection records yet'}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Monthly amounts and balances will be shown per membership slot.</span>
            <span>0 records</span>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          description="Keep the winning customer, payout amount, payments, and remaining balance visible."
          title="Winner payouts"
        >
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Chit group
              </span>
              <select
                aria-label="Filter payouts by chit group"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500"
              >
                <option>All chit groups</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Auction month
              </span>
              <input
                aria-label="Filter payouts by month"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500"
                type="month"
              />
            </label>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_0.9fr_1fr_0.8fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold tracking-[0.07em] text-slate-500 uppercase">
                <span>Winning customer</span>
                <span>Calculated payout</span>
                <span>Actual amount paid</span>
                <span>Payment date</span>
                <span>Remaining balance</span>
                <span>Payout status</span>
              </div>
              <EmptyState
                description="Winner payouts are tracked separately from member monthly collections."
                icon={Trophy}
                title="No winner payouts yet"
              />
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-start gap-3">
              <Clock3 aria-hidden="true" className="mt-0.5 shrink-0 text-blue-700" size={16} />
              <p className="text-xs leading-5 text-blue-900">
                Payout status will reflect paid, partially paid, pending, or overdue amounts.
                Payout calculations are not performed in this section.
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Record full or partial payments', icon: Banknote },
          { title: 'Review pending balances', icon: CircleDollarSign },
          { title: 'Track payout history', icon: Trophy },
        ].map(({ icon: Icon, title }) => (
          <div
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40"
            key={title}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Icon aria-hidden="true" size={17} />
            </span>
            <p className="text-xs font-semibold leading-5 text-slate-700">{title}</p>
          </div>
        ))}
      </div>

      {showRecordDialog && <PaymentEntryPreview onClose={closeRecordDialog} />}
    </>
  )
}
