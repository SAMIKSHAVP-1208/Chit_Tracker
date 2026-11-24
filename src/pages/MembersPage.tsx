import { useState } from 'react'
import {
  ContactRound,
  Search,
  UserPlus,
  UsersRound,
  UserRoundPlus,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'

type MemberTab = 'directory' | 'memberships'

function CustomerFormPreview({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      description="Customer details stay separate from chit memberships."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Layout preview only. Customer records are not being saved.
          </p>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button disabled variant="primary">
              Save customer
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
      title="Add customer"
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Customer name
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Full name"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Mobile number
          </span>
          <input
            autoComplete="tel"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            inputMode="tel"
            placeholder="10-digit mobile number"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Email address
          </span>
          <input
            autoComplete="email"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Optional"
            type="email"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Address
          </span>
          <textarea
            className="min-h-20 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Optional"
          />
        </label>
      </form>
    </Modal>
  )
}

function EnrollCustomerPreview({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      description="Link an existing customer to a chit group. One slot may be shared by two customers."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Enrollment is unavailable until customer and group records are connected.
          </p>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button disabled variant="primary">
              Enroll customer
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
      title="Enroll customer in chit"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Customer
          </span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <option>Select a customer</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Chit name
          </span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <option>Select a chit group</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Membership slot
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Slot position"
          />
        </label>
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <p className="text-xs font-semibold text-blue-900">Joint membership</p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            A second customer can share this slot. Each person keeps a separate customer
            profile, while the joint membership counts as one slot.
          </p>
          <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-700">
            <input className="rounded border-slate-300 text-blue-700" type="checkbox" />
            Add a second customer to this slot
          </label>
        </div>
      </div>
    </Modal>
  )
}

export function MembersPage() {
  const [activeTab, setActiveTab] = useState<MemberTab>('directory')
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false)

  function updateSearch(value: string) {
    setSearch(value)
    if (value) setSearchParams({ q: value }, { replace: true })
    else setSearchParams({}, { replace: true })
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button
              icon={<UserPlus aria-hidden="true" size={16} />}
              onClick={() => setShowCustomerForm(true)}
            >
              Add Customer
            </Button>
            <Button
              icon={<UserRoundPlus aria-hidden="true" size={16} />}
              onClick={() => setShowEnrollmentForm(true)}
              variant="primary"
            >
              Enroll Customer
            </Button>
          </>
        }
        description="Keep customer profiles in one place and see which chit groups they belong to."
        title="Members"
      />

      <SectionCard
        description="A customer can join multiple groups. Joint members keep separate profiles and share one membership slot."
        title="Customer directory"
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            aria-label="Member views"
            className="inline-flex w-fit rounded-xl bg-slate-100 p-1"
            role="tablist"
          >
            <button
              aria-selected={activeTab === 'directory'}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                activeTab === 'directory'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('directory')}
              role="tab"
              type="button"
            >
              Customer directory
            </button>
            <button
              aria-selected={activeTab === 'memberships'}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                activeTab === 'memberships'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('memberships')}
              role="tab"
              type="button"
            >
              Chit memberships
            </button>
          </div>
          <label className="relative block w-full max-w-sm">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              aria-label="Search by customer name or mobile number"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              onChange={(event) => updateSearch(event.currentTarget.value)}
              placeholder="Search name or mobile number"
              value={search}
            />
          </label>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-xs font-medium text-slate-600">
            Filter by chit name
          </label>
          <select
            aria-label="Filter by chit name"
            className="h-10 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 outline-none focus:border-blue-400"
          >
            <option>All chit groups</option>
          </select>
        </div>

        {activeTab === 'directory' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_0.8fr_1fr_0.8fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                <span>Customer</span>
                <span>Mobile number</span>
                <span>Chit memberships</span>
                <span>Profile</span>
                <span>Payment history</span>
                <span>Actions</span>
              </div>
              <EmptyState
                description={
                  search
                    ? `No customers match “${search}”.`
                    : 'Add a customer to start your central directory. Customer records will be connected in a later section.'
                }
                icon={ContactRound}
                title={search ? 'No matching customers' : 'No customers yet'}
              />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <div className="grid grid-cols-[1.3fr_1.3fr_0.8fr_1fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase max-sm:grid-cols-[1fr_1fr]">
              <span>Chit name</span>
              <span>Customer(s)</span>
              <span className="max-sm:hidden">Slot</span>
              <span className="max-sm:hidden">Membership type</span>
            </div>
            <EmptyState
              description="Enrollments will be listed here. A joint membership can include two customer profiles but always uses one chit slot."
              icon={UsersRound}
              title="No chit memberships yet"
            />
          </div>
        )}
      </SectionCard>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ['Customer profiles', 'Keep each person’s contact details and payment history together.'],
          ['Multiple memberships', 'One customer may join more than one chit group.'],
          ['Joint membership', 'Two people can share one slot while keeping separate profiles.'],
        ].map(([title, description]) => (
          <div
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40"
            key={title}
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UsersRound aria-hidden="true" size={17} />
            </div>
            <p className="text-xs font-semibold text-slate-800">{title}</p>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
          </div>
        ))}
      </div>

      {showCustomerForm && (
        <CustomerFormPreview onClose={() => setShowCustomerForm(false)} />
      )}
      {showEnrollmentForm && (
        <EnrollCustomerPreview onClose={() => setShowEnrollmentForm(false)} />
      )}
    </>
  )
}
