import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'

const STATS = [
  { label: 'Products listed', value: '48' },
  { label: 'Gallery items', value: '23' },
  { label: 'Low stock', value: '4' },
  { label: 'Advertise status', value: 'Live' },
]

const SHORTCUTS = [
  { to: '/advertise', title: 'Advertise panel', desc: 'Update the home-page video + description.' },
  { to: '/product-price', title: 'Product price', desc: 'Manage products and pricing.' },
  { to: '/gallery', title: 'Gallery', desc: 'Curate showcase images.' },
  { to: '/account', title: 'Account', desc: 'Profile and store settings.' },
]

export default function Home() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — manage everything that powers the Glow with Azmir storefront."
        actions={
          <Link to="/advertise" className="btn btn-primary">
            Edit advertise section
          </Link>
        }
      />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {STATS.map((s) => (
          <div key={s.label} className="card">
            <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 34, fontSize: 18 }}>Quick actions</h2>
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
      >
        {SHORTCUTS.map((s) => (
          <Link key={s.to} to={s.to} className="card" style={{ display: 'block', color: 'inherit' }}>
            <div className="spread">
              <strong style={{ fontSize: 16 }}>{s.title}</strong>
              <span style={{ color: 'var(--gold-dark)' }}>→</span>
            </div>
            <p className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>
              {s.desc}
            </p>
          </Link>
        ))}
      </div>

      <h2 style={{ marginTop: 34, fontSize: 18 }}>Recent activity</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Home-page advertise video</td>
              <td>Advertise</td>
              <td><StatusPill status="active" /></td>
            </tr>
            <tr>
              <td>Rose Glow Serum</td>
              <td>Product</td>
              <td><StatusPill status="low" /></td>
            </tr>
            <tr>
              <td>Summer Collection banner</td>
              <td>Gallery</td>
              <td><StatusPill status="active" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
