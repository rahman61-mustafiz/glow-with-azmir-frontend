import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { fmtBDT } from '../data/products.js'
import { getTodaySales } from '../api/sales.js'
import { getProducts } from '../api/products.js'
import { getGallery } from '../api/gallery.js'
import { getAdvertise } from '../api/advertise.js'

const SHORTCUTS = [
  { to: '/admin', title: 'Accounting', desc: 'Revenue, profit, units sold & stock.' },
  { to: '/admin/products', title: 'Product price', desc: 'Manage products, buying & selling prices.' },
  { to: '/admin/advertise', title: 'Advertise panel', desc: 'Update the home-page video + description.' },
  { to: '/admin/gallery', title: 'Gallery', desc: 'Curate showcase images.' },
]

export default function Home() {
  const [view, setView] = useState('overview') // 'overview' | 'today'

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — manage everything that powers the Glow with Azmir storefront."
        actions={
          <Link to="/admin/advertise" className="btn btn-primary">
            Edit advertise section
          </Link>
        }
      />

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
  const [stats, setStats] = useState(null)
  const [lowProducts, setLowProducts] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([getProducts(), getGallery(), getAdvertise()])
      .then(([products, gallery, advertise]) => {
        if (!active) return
        const low = products.filter((p) => p.status === 'low')
        setLowProducts(low)
        setStats([
          { label: 'Products listed', value: String(products.length) },
          { label: 'Gallery items', value: String(gallery.length) },
          { label: 'Low stock', value: String(low.length) },
          { label: 'Advertise status', value: advertise.videoUrl ? 'Live' : 'No video' },
        ])
      })
      .catch(() => active && setStats([]))
    return () => {
      active = false
    }
  }, [])

  if (!stats) return <div className="card muted">Loading…</div>

  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
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
            <p className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>{s.desc}</p>
          </Link>
        ))}
      </div>

      <h2 style={{ marginTop: 34, fontSize: 18 }}>Low stock</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Product</th><th>Stock</th><th>Status</th></tr>
          </thead>
          <tbody>
            {lowProducts.length === 0 ? (
              <tr><td colSpan={3} className="muted">Nothing low on stock 🎉</td></tr>
            ) : (
              lowProducts.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.stock}</td>
                  <td><StatusPill status="low" /></td>
                </tr>
              ))
            )}
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
  const [err, setErr] = useState('')

  // Poll every 15s so new sales (from the Sales-entry tab / tablet) appear live.
  useEffect(() => {
    let active = true
    const refresh = () =>
      getTodaySales()
        .then((d) => {
          if (!active) return
          setData(d)
          setErr('')
        })
        .catch(() => active && setErr('Could not reach the backend.'))
        .finally(() => active && setLoading(false))
    refresh()
    const t = setInterval(refresh, 15000)
    return () => {
      active = false
      clearInterval(t)
    }
  }, [])

  if (loading) return <div className="card muted">Loading today's sales…</div>
  if (err) return <div className="card" style={{ color: '#9b1c1c' }}>{err}</div>

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
              <th>Order</th><th>Product</th><th>Qty</th><th>Time</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr><td colSpan={5} className="muted">No sales yet today.</td></tr>
            ) : (
              data.items.map((s) => (
                <tr key={s.id}>
                  <td className="muted">{s.id.slice(-6)}</td>
                  <td><strong>{s.product}</strong></td>
                  <td>{s.qty}</td>
                  <td className="muted">{s.time}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtBDT(s.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>
        Updates automatically every 15s — new sales from the Sales-entry tab / tablet appear here.
      </p>
    </>
  )
}
