import {
  CloudDownload,
  KeyRound,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'

function DisabledField({
  label,
  placeholder,
  value,
}: {
  label: string
  placeholder?: string
  value?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <input
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 disabled:cursor-not-allowed"
        disabled
        placeholder={placeholder}
        value={value ?? ''}
      />
    </label>
  )
}

export function SettingsPage() {
  return (
    <>
      <PageHeader
        description="Business details and account controls. Changes are not available until secure storage and authentication are connected."
        title="Settings"
      />

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
        <div className="flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-blue-700" size={17} />
          <p className="text-xs leading-5 text-blue-900">
            Settings are shown as a layout preview. This page does not save account, backup,
            or business changes.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <SectionCard
          description="The name and contact details shown to your members."
          title="Business Profile"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DisabledField label="Business name" value="Sri Kumaran Chits" />
            <DisabledField label="Contact number" placeholder="Add business contact number" />
            <DisabledField label="Email address" placeholder="Add business email" />
            <DisabledField label="Address" placeholder="Add business address" />
            <div className="md:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Business logo</span>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <img
                    alt="Sri Kumaran Chits logo"
                    className="size-full rounded-xl object-contain"
                    src="/images/sri-kumaran-chits-logo.jpeg"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-700">
                    Current business logo
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Logo editing will be available when profile settings are connected.
                  </p>
                </div>
                <Button disabled>Change logo</Button>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Login and password controls for the administrator."
          title="Account Settings"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DisabledField label="Login email" placeholder="Authentication not connected" />
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Password
              </span>
              <Button disabled icon={<KeyRound aria-hidden="true" size={15} />}>
                Change password
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Administrator access management will be available after authentication is configured."
          title="User Management"
        >
          <EmptyState
            compact
            description="Administrator accounts will be listed here. No user accounts are connected."
            icon={UsersRound}
            title="No additional administrators"
          />
          <div className="mt-4 flex justify-center border-t border-slate-100 pt-4">
            <Button disabled>Add administrator</Button>
          </div>
        </SectionCard>

        <SectionCard
          description="Backup and restore controls require a secure backend and are not active yet."
          title="Backup & Restore"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <CloudDownload aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Backup history</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Existing backups will appear here after secure backup storage is configured.
                  </p>
                </div>
              </div>
              <EmptyState
                compact
                description="No backup history is available."
                icon={CloudDownload}
                title="No backups yet"
              />
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button disabled>Create backup</Button>
              <Button disabled variant="primary">
                Restore backup
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  )
}
