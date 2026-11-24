import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Gavel,
  Layers3,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'

const metrics = [
  { label: 'Total active chits', icon: Layers3 },
  { label: 'Upcoming chits', icon: CalendarDays },
  { label: 'Total members', icon: UsersRound },
  { label: "Today's collections", icon: Banknote },
  { label: 'Pending collections', icon: CircleDollarSign },
  { label: 'Upcoming auctions', icon: Gavel },
]

function MetricCard({
  icon: Icon,
  label,
}: {
  icon: (typeof metrics)[number]['icon']
  label: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">—</p>
      <p className="mt-1 text-xs text-slate-400">No records yet</p>
    </article>
  )
}

function EmptyDashboardSection({
  icon,
  title,
  description,
  to,
  linkText,
}: {
  icon: LucideIcon
  title: string
  description: string
  to: string
  linkText: string
}) {
  return (
    <SectionCard
      action={
        <Link
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
          to={to}
        >
          {linkText}
          <ArrowRight aria-hidden="true" size={14} />
        </Link>
      }
      title={title}
    >
      <EmptyState compact description={description} icon={icon} title="Nothing scheduled yet" />
    </SectionCard>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => navigate('/chit-groups?create=1')}>
              Create a chit
            </Button>
            <Button
              onClick={() => navigate('/collections?record=1')}
              variant="primary"
            >
              Record payment
            </Button>
          </>
        }
        description="A clear view of your chits, collections, and upcoming work."
        title="Dashboard"
      />

      <section
        aria-label="Operational summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <EmptyDashboardSection
          description="Upcoming chit starts will appear here once groups are added."
          icon={CalendarDays}
          linkText="View chit groups"
          title="Upcoming chit starts"
          to="/chit-groups"
        />
        <EmptyDashboardSection
          description="Auction dates and group details will appear here when available."
          icon={Gavel}
          linkText="View auctions"
          title="Upcoming auction dates"
          to="/auctions"
        />
        <EmptyDashboardSection
          description="Payment entries will appear here after they are recorded."
          icon={Banknote}
          linkText="View collections"
          title="Recently recorded payments"
          to="/collections"
        />
        <EmptyDashboardSection
          description="Members with unpaid dues will be listed here when collection records exist."
          icon={UsersRound}
          linkText="View members"
          title="Members with pending payments"
          to="/members"
        />
        <SectionCard
          className="xl:col-span-2"
          title="Monthly collection summary"
          description="A month-by-month view will be available when collection records are connected."
        >
          <EmptyState
            compact
            description="There is no collection data to chart yet."
            icon={CircleDollarSign}
            title="Summary will appear here"
          />
        </SectionCard>
      </div>
    </>
  )
}
