import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  CirclePlus,
  Gavel,
  Search,
  UsersRound,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'

const filters = ['All groups', 'Upcoming', 'Active', 'Completed'] as const
type GroupFilter = (typeof filters)[number]

function ChitCreationPreview({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      description="Enter the group details. Saving is disabled until secure data storage is connected."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            This form is a layout preview. No details will be saved.
          </p>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button disabled variant="primary">
              Save chit group
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
      title="Create new chit"
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Chit name <span className="text-rose-600">*</span>
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Enter your unique chit name"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Chit amount
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
            Duration (months)
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            min="1"
            placeholder="Number of months"
            type="number"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Membership slots
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            min="1"
            placeholder="Number of slots"
            type="number"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Start date
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            type="date"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Monthly due date
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            type="date"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Auction date
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            type="date"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Owner commission
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            defaultValue="2000"
            min="0"
            type="number"
          />
          <span className="mt-1 block text-[11px] text-slate-400">
            Default commission: ₹2,000
          </span>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Status
          </span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400">
            <option>Upcoming</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Remarks
          </span>
          <textarea
            className="min-h-20 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Optional notes"
          />
        </label>
      </form>
    </Modal>
  )
}

export function ChitGroupsPage() {
  const [activeFilter, setActiveFilter] = useState<GroupFilter>('All groups')
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const createOpen = searchParams.get('create') === '1'

  useEffect(() => {
    if (createOpen) {
      document.getElementById('chit-search')?.blur()
    }
  }, [createOpen])

  function closeCreateDialog() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('create')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <>
      <PageHeader
        actions={
          <Button
            icon={<CirclePlus aria-hidden="true" size={16} />}
            onClick={() => setSearchParams({ create: '1' })}
            variant="primary"
          >
            Create New Chit
          </Button>
        }
        description="Set up and manage each chit group from one place."
        title="Chit Groups"
      />

      <SectionCard
        description="Search by the chit name you assigned. Group codes are not used."
        title="Your chit groups"
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              aria-label="Search chit name"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              id="chit-search"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search by chit name"
              value={search}
            />
          </div>
          <div aria-label="Filter chit groups by status" className="flex flex-wrap gap-1.5" role="group">
            {filters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  activeFilter === filter
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          <div className="grid grid-cols-[minmax(150px,1.5fr)_1fr_0.8fr_1fr_0.8fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase max-sm:grid-cols-[minmax(130px,1.5fr)_1fr_0.8fr]">
            <span>Chit name</span>
            <span>Amount</span>
            <span>Slots</span>
            <span className="max-sm:hidden">Start date</span>
            <span className="max-sm:hidden">Status</span>
          </div>
          <div className="px-3">
            <EmptyState
              action={
                <Link
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  to="/chit-groups/workspace"
                >
                  Preview group workspace
                  <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              }
              description={
                search
                  ? `No chit groups match “${search}”. Try another name or clear the search.`
                  : 'There are no chit groups to show yet. Create a group to get started, or preview the group workspace layout.'
              }
              icon={UsersRound}
              title={search ? 'No matching chit groups' : 'No chit groups yet'}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            {activeFilter === 'All groups'
              ? 'Showing all groups'
              : `Showing ${activeFilter.toLowerCase()} groups`}
          </span>
          <span>0 groups</span>
        </div>
      </SectionCard>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { name: 'Upcoming chit groups', icon: CalendarDays },
          { name: 'Active chit groups', icon: UsersRound },
          { name: 'Completed chit groups', icon: CirclePlus },
        ].map(({ icon: Icon, name }) => (
          <div
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40"
            key={name}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Icon aria-hidden="true" size={17} />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500">{name}</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">0</p>
            </div>
          </div>
        ))}
      </div>

      {createOpen && <ChitCreationPreview onClose={closeCreateDialog} />}
    </>
  )
}

const groupTabs = [
  { label: 'Overview', path: 'overview' },
  { label: 'Members', path: 'members' },
  { label: 'Monthly Auctions', path: 'auctions' },
  { label: 'Collections', path: 'collections' },
  { label: 'Winner Payouts', path: 'payouts' },
]

const tabContent = {
  overview: {
    title: 'Group overview',
    description:
      'Group details, upcoming dates, and a simple collection summary will be shown here.',
  },
  members: {
    title: 'Group members',
    description:
      'Each membership slot can be assigned to one customer or shared by two joint members. A joint membership remains one slot.',
  },
  auctions: {
    title: 'Monthly auctions',
    description:
      'Auction dates, winners, and finalized calculation snapshots will be managed here. Calculations are not available yet.',
  },
  collections: {
    title: 'Collections',
    description:
      'Monthly dues, payment dates, partial payments, and outstanding balances for this group will appear here.',
  },
  payouts: {
    title: 'Winner payouts',
    description:
      'Winner, calculated payout, amount paid, payment date, and remaining payout balance will be tracked here.',
  },
} as const

export function ChitGroupWorkspacePage() {
  const { tab = 'overview' } = useParams<{ tab?: string }>()
  const activeTab = groupTabs.some((item) => item.path === tab) ? tab : 'overview'
  const content = tabContent[activeTab as keyof typeof tabContent]

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700"
        to="/chit-groups"
      >
        ← Back to chit groups
      </Link>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase">
            Layout preview · no group data
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Chit group workspace
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The group name will appear here when a group is selected.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/10">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Preview only
        </span>
      </div>

      <nav
        aria-label="Chit group sections"
        className="mb-5 flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm shadow-slate-200/30"
      >
        {groupTabs.map(({ label, path }) => (
          <Link
            aria-current={activeTab === path ? 'page' : undefined}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === path
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            key={path}
            to={`/chit-groups/workspace/${path}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {activeTab === 'overview' ? (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <SectionCard
            description="A quick look at the selected chit group."
            title={content.title}
          >
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                'Chit amount',
                'Duration',
                'Membership slots',
                'Start date',
                'Monthly due date',
                'Auction date',
                'Owner commission',
                'Status',
              ].map((label) => (
                <div className="rounded-xl bg-slate-50 px-4 py-3" key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-700">—</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
          <div className="space-y-5">
            <SectionCard title="Upcoming auction">
              <EmptyState
                compact
                description="Auction details will appear here when this group has records."
                icon={Gavel}
                title="No auction scheduled"
              />
            </SectionCard>
            <SectionCard title="Collection summary">
              <EmptyState
                compact
                description="Collection totals will appear after payment records are available."
                icon={CirclePlus}
                title="No collection data"
              />
            </SectionCard>
          </div>
        </div>
      ) : (
        <SectionCard
          description={content.description}
          title={content.title}
        >
          <EmptyState
            description="Select a real chit group after groups are connected to the application."
            icon={activeTab === 'members' ? UsersRound : activeTab === 'auctions' ? Gavel : CirclePlus}
            title={`No ${content.title.toLowerCase()} to show`}
          />
          {activeTab === 'auctions' && (
            <p className="mx-auto mt-3 max-w-2xl rounded-xl bg-amber-50 px-4 py-3 text-center text-xs leading-5 text-amber-800">
              Finalized auction records will be preserved if group settings change. Auction
              calculations are not implemented in this layout section.
            </p>
          )}
        </SectionCard>
      )}
    </>
  )
}
