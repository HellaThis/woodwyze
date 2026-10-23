import { NavLink, Outlet, Link } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/quote', label: 'Quote a job' },
  { to: '/plan', label: 'Plan a build' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/shop', label: 'My shop' },
]

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="WoodWyze home">
      <img src={logo} alt="" className="h-9 w-auto" />
      <span className={`display text-[22px] ${light ? 'text-white' : 'text-forest'}`}>WoodWyze</span>
    </Link>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-[15px] font-medium ${isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white'}`
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print bg-forest">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo light />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="rounded-md px-3 py-2 text-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            Menu
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="flex flex-col gap-1 px-4 pb-3 md:hidden" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass} onClick={() => setOpen(false)}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="no-print border-t border-rule bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-graphite/70 sm:flex-row sm:items-center sm:justify-between">
          <span>WoodWyze prototype. Sample data only; nothing here is sent anywhere.</span>
          <span className="flex gap-4">
            <Link to="/survey?t=demo-1042" className="hover:text-forest">
              Survey page
            </Link>
            <Link to="/admin" className="hover:text-forest">
              Outreach admin
            </Link>
            <Link to="/settings" className="hover:text-forest">
              Rates and prices
            </Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
