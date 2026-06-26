import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { fmtBDT } from '../data/products.js'
import { getTodaySales } from '../api/sales.js'
import { subscribe } from '../data/salesStore.js'

const STATS = [
  { label: 'Products listed', value: '5' },
  { label: 'Gallery items', value: '6' },
  { label: 'Low stock', value: '2' },
  { label: 'Advertise status', value: 'Live' },
]

const SHORTCUTS = [
  { to: '/advertise', title: 'Advertise panel', desc: 'Update the home-page video + description.' },
  { to: '/product-price', title: 'Product price', desc: 'Manage products, buying & selling prices.' },
  { to: '/gallery', title: 'Gallery', desc: 'Curate showcase images.' },
  { to: '/accounting', title: 'Accounting', desc: 'Income, expenses, profit & stock value.' },
]

export default function Home() {
  const [view, setView] = useState('overview') // 'overview' | 'today'

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

      {/* Dashboard view switcher */}
      <div className="seg">
        <button
          className={'seg-btn' + (view === 'overview' ? ' is-active' : '')}
          onClick={() => setView('overview')}
          type="button"
        >
          Overview
        </button>
        <button
          className={'seg-btn' + (view === 'today' ? ' is-active' : '')}
          onClick={() => setView('today')}
          type="button"
        >
          Today's sales
        </button>
      </div>

      {view === 'overview' ? <Overview /> : <TodaySales />}
    </>
  )
}

/* ---------------- Overview ---------------- */
function Overview() {
  return (
    <>
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
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
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

/* ---------------- Today's sales ---------------- */
function TodaySales() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // NOTE: stubbed fetch. When wired, this is where a live feed / poll / socket
  // would push new sales as customers buy products. For now we subscribe to the
  // client-side sales store so sales entered on the Sales-entry tab show up here.
  useEffect(() => {
    let active = true
    const refresh = () =>
      getTodaySales()
        .then((d) => active && setData(d))
        .finally(() => active && setLoading(false))
    refresh()
    const unsub = subscribe(refresh)
    return () => {
      active = false
      unsub()
    }
  }, [])

  if (loading || !data) {
    return <div className="card muted">Loading today's sales…</div>
  }

  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <div className="card" style={{ background: 'var(--black)' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>
            Today's total sales
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: 'var(--gold)' }}>
            {fmtBDT(data.total)}
          </div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Orders today</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{data.orders}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Items sold</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{data.count}</div>
        </div>
      </div>

      <div className="spread" style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Recent sales feed</h2>
        <span className="pill pill-active">● Live</span>
      </div>
      <div className="card" style={{ padding: 0, marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Time</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((s) => (
              <tr key={s.id}>
                <td className="muted">{s.id}</td>
                <td><strong>{s.product}</strong></td>
                <td>{s.qty}</td>
                <td className="muted">{s.time}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtBDT(s.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
        {/* TODO(backend): wire to GET /api/sales/today + a live stream so new
            purchases appear here automatically. */}
        Note: sales are stubbed data — when a customer buys a product this feed
        will update automatically once the backend is connected.
      </p>
    </>
  )
}
