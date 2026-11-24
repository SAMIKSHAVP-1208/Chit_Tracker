type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue'
type GroupStatus = 'Upcoming' | 'Active' | 'Completed'

type StatusBadgeProps = {
  status: PaymentStatus | GroupStatus
}

const styles: Record<PaymentStatus | GroupStatus, string> = {
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  'Partially Paid': 'bg-amber-50 text-amber-700 ring-amber-600/15',
  Pending: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  Overdue: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  Upcoming: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  Completed: 'bg-slate-100 text-slate-600 ring-slate-500/15',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  )
}
