import { NavLink } from 'react-router-dom'
import './layout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/account', label: 'Account' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/product-price', label: 'Product price' },
  { to: '/advertise', label: 'Advertise panel' },
]

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      {/* Bold header — black top bar with gold wordmark + primary action */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="wordmark">
            <span className="wordmark-mark">✦</span>
            <span className="wordmark-text">Glow with Azmir</span>
          </div>

          <nav className="topnav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  'topnav-link' + (isActive ? ' is-active' : '')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="topbar-actions">
            <span className="admin-badge">Admin</span>
          </div>
        </div>
      </header>

      {/* White content area */}
      <main className="content">
        <div className="content-inner">{children}</div>
      </main>

      <footer className="footer">
        <span className="muted">
          Glow with Azmir · Admin panel · part of the noor-beauty project
        </span>
      </footer>
    </div>
  )
}
