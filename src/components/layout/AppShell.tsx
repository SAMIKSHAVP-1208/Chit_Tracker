import { useState } from 'react'
import {
  Banknote,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UsersRound,
  X,
  Layers3,
  Gavel,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Chit Groups', to: '/chit-groups', icon: Layers3 },
  { label: 'Members', to: '/members', icon: UsersRound },
  { label: 'Monthly Auctions', to: '/auctions', icon: Gavel },
  { label: 'Collections & Payments', to: '/collections', icon: Banknote },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/chit-groups/')) return 'Chit group workspace'
  return navigation.find((item) => item.to === pathname)?.label ?? 'Dashboard'
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = getPageTitle(location.pathname)

  function searchCustomers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('customer-search') ?? '').trim()
    navigate(query ? `/members?q=${encodeURIComponent(query)}` : '/members')
  }

  function showSignOutNotice() {
    setAccountOpen(false)
    setNotice('Sign out will be available after authentication is connected.')
    window.setTimeout(() => setNotice(''), 4000)
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fb] text-slate-900">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-white/5 bg-[#111c35] text-white transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-[272px]'}`}
      >
        <div className="flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 px-5 lg:px-4">
          <img
            alt="Sri Kumaran Chits logo"
            className="size-12 shrink-0 bg-transparent object-contain"
            src="/images/sri-kumaran-chits-logo.png"
          />
          <div className={collapsed ? 'lg:sr-only' : ''}>
            <p className="text-[17px] font-semibold tracking-tight text-white">
              Sri Kumaran Chits
            </p>
            <p className="mt-1 text-[10px] font-medium tracking-[0.11em] text-amber-300 uppercase">
              Trust Today. Wealth Tomorrow.
            </p>
          </div>
          <button
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-6">
          <p
            className={`mb-3 px-3 text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase ${
              collapsed ? 'lg:sr-only' : ''
            }`}
          >
            Workspace
          </p>
          {navigation.map(({ end, icon: Icon, label, to }) => (
            <NavLink
              aria-label={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
                    : 'text-slate-300 hover:bg-white/7 hover:text-white'
                } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`
              }
              end={Boolean(end)}
              key={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              to={to}
            >
              <Icon aria-hidden="true" className="shrink-0" size={18} strokeWidth={1.8} />
              <span className={collapsed ? 'lg:sr-only' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div
            className={`rounded-xl border border-white/8 bg-white/5 p-3 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                <CircleHelp size={15} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-100">Need a hand?</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  Your workspace is ready to set up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 sm:py-0 lg:px-8">
            <button
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Menu size={19} />
            </button>
            <button
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
              type="button"
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div className="min-w-0 flex-1 xl:min-w-[170px] xl:flex-none">
              <p className="text-[10px] font-medium tracking-[0.12em] text-slate-400 uppercase">
                Workspace
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-900 sm:text-sm">
                {pageTitle}
              </p>
            </div>
            <form
              className="relative order-last w-full max-w-[340px] sm:order-none sm:ml-auto sm:flex-1 sm:w-auto lg:ml-0"
              onSubmit={searchCustomers}
              role="search"
            >
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                aria-label="Search customers"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pr-3 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                name="customer-search"
                placeholder="Search customers..."
                type="search"
              />
            </form>

            <div className="hidden items-center gap-2 xl:flex">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => navigate('/chit-groups?create=1')}
                type="button"
              >
                <Command aria-hidden="true" size={15} />
                New chit
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"
                onClick={() => navigate('/collections?record=1')}
                type="button"
              >
                <Banknote aria-hidden="true" size={15} />
                Record payment
              </button>
            </div>

            <div className="relative ml-auto border-l border-slate-200 pl-3 sm:ml-1 sm:pl-4">
              <button
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-slate-50"
                onClick={() => setAccountOpen((value) => !value)}
                type="button"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#e7edf8] text-xs font-bold text-[#1a315b]">
                  A
                </span>
                <span className="hidden sm:block">
                  <span className="block text-xs font-semibold text-slate-800">
                    Administrator
                  </span>
                  <span className="block text-[10px] text-slate-500">Account</span>
                </span>
                <ChevronDown aria-hidden="true" className="hidden text-slate-400 sm:block" size={15} />
              </button>
              {accountOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] z-30 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                  role="menu"
                >
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-800">Administrator</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Authentication not connected
                    </p>
                  </div>
                  <button
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setAccountOpen(false)
                      navigate('/settings')
                    }}
                    role="menuitem"
                    type="button"
                  >
                    <Settings size={15} />
                    Account settings
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-50"
                    onClick={showSignOutNotice}
                    role="menuitem"
                    type="button"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>

      {notice && (
        <div
          className="fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-xl"
          role="status"
        >
          {notice}
        </div>
      )}
    </div>
  )
}
