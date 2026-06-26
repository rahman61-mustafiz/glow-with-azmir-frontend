import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, CATEGORIES, fmtBDT } from '../data/products.js'
import { recordSale, getTodaySales } from '../api/sales.js'
import { suggestCustomers, lookupCustomer } from '../api/customers.js'
import './sales-entry.css'

// "Sales entry" — manual input system for the tablet, modelled on the Noor
// booking tablet: categories | product grid | customer + cart + confirm.
// Admin records each sale: client name, phone, and the product(s) bought.

export default function SalesEntry() {
  const [category, setCategory] = useState(null) // null = All
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([]) // [{ id, name, price, qty }]

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [customer, setCustomer] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [todayTotal, setTodayTotal] = useState(null)

  const phoneTimer = useRef(null)

  // Today's running total (for the header chip).
  useEffect(() => {
    getTodaySales().then((d) => setTodayTotal(d.total))
  }, [success])

  // Phone type-ahead + lookup (debounced), mirroring the Noor flow.
  useEffect(() => {
    const digits = phone.replace(/\D/g, '')
    if (phoneTimer.current) clearTimeout(phoneTimer.current)
    if (digits.length < 4) {
      setSuggestions([])
      return
    }
    phoneTimer.current = setTimeout(async () => {
      setSuggestions(await suggestCustomers(digits))
      if (digits.length >= 11) {
        const c = await lookupCustomer(digits)
        setCustomer(c)
        if (c.found) setName(c.name)
      }
    }, 350)
    return () => clearTimeout(phoneTimer.current)
  }, [phone])

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return PRODUCTS.filter((p) => {
      const inCat = !category || p.category === category
      const inSearch = !q || p.name.toLowerCase().includes(q)
      return inCat && inSearch
    })
  }, [category, search])

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0)
  const totalQty = cart.reduce((s, l) => s + l.qty, 0)

  function addToCart(p) {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.id === p.id)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], qty: next[i].qty + 1 }
        return next
      }
      return [...prev, { id: p.id, name: p.name, price: p.sellPrice, qty: 1 }]
    })
  }

  function setQty(id, delta) {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    )
  }

  function removeLine(id) {
    setCart((prev) => prev.filter((l) => l.id !== id))
  }

  function pickSuggestion(s) {
    setPhone(s.phone)
    setName(s.name)
    setSuggestions([])
    setCustomer({ found: true, name: s.name, phone: s.phone, lastItems: s.lastItems })
  }

  function resetForm() {
    setCart([])
    setPhone('')
    setName('')
    setSuggestions([])
    setCustomer(null)
    setSearch('')
  }

  async function confirm() {
    if (!name.trim()) return alert('Client name is required')
    if (cart.length === 0) return alert('Add at least one product')
    setSubmitting(true)
    try {
      // TODO(backend): recordSale posts to the sales API (stubbed for now).
      const sale = await recordSale({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        items: cart.map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
      })
      setSuccess(sale)
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const qtyInCart = (id) => cart.find((l) => l.id === id)?.qty ?? 0

  return (
    <div className="sales">
      {/* Header bar */}
      <div className="sales-head">
        <div>
          <h1>Sales entry</h1>
          <p className="muted">
            Record a sale — client name, phone &amp; product(s). For tablet use.
          </p>
        </div>
        <div className="row">
          {todayTotal != null && (
            <span className="today-chip">
              Today: <strong>{fmtBDT(todayTotal)}</strong>
            </span>
          )}
          <Link to="/" className="btn btn-ghost">
            View Today's sales →
          </Link>
        </div>
      </div>

      {/* 3-panel layout (Noor-style) */}
      <div className="sales-grid">
        {/* Categories */}
        <aside className="cat-panel card">
          <div className="cat-title">CATEGORIES</div>
          <button
            className={'cat-tile' + (category === null ? ' is-active' : '')}
            onClick={() => setCategory(null)}
          >
            <span>All products</span>
            <span className="cat-count">{PRODUCTS.length}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={'cat-tile' + (category === c ? ' is-active' : '')}
              onClick={() => setCategory(c)}
            >
              <span>{c}</span>
              <span className="cat-count">{PRODUCTS.filter((p) => p.category === c).length}</span>
            </button>
          ))}
        </aside>

        {/* Product grid */}
        <section className="prod-panel">
          <input
            className="input prod-search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="prod-grid">
            {visibleProducts.length === 0 && (
              <div className="muted" style={{ padding: 20 }}>No products found.</div>
            )}
            {visibleProducts.map((p) => {
              const n = qtyInCart(p.id)
              return (
                <button
                  key={p.id}
                  className={'prod-card' + (n > 0 ? ' is-selected' : '')}
                  onClick={() => addToCart(p)}
                >
                  {n > 0 && <span className="prod-qty-badge">{n}</span>}
                  <span className="prod-name">{p.name}</span>
                  <span className="prod-meta">
                    <span className="prod-price">{fmtBDT(p.sellPrice)}</span>
                    <span className={'prod-stock' + (p.status === 'low' ? ' low' : '')}>
                      {p.stock} in stock
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Customer + cart + confirm */}
        <aside className="order-panel card">
          <h2 className="order-title">Client &amp; order</h2>

          {/* Phone */}
          <label className="field-label">Phone number</label>
          <input
            className="input"
            inputMode="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {suggestions.length > 0 && (
            <div className="suggest-box">
              {suggestions.map((s) => (
                <button key={s.phone} className="suggest-item" onClick={() => pickSuggestion(s)}>
                  <span>{s.name || 'Unnamed'}</span>
                  <span className="muted">{s.phone}</span>
                </button>
              ))}
            </div>
          )}
          {customer?.found && (
            <div className="returning">
              <span className="pill pill-active">Returning</span>
              {customer.lastItems?.length > 0 && (
                <span className="muted" style={{ fontSize: 12 }}>
                  Last: {customer.lastItems.join(', ')}
                </span>
              )}
            </div>
          )}

          {/* Name */}
          <label className="field-label" style={{ marginTop: 12 }}>Client name</label>
          <input
            className="input"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Cart */}
          <div className="cart-label">PRODUCTS BOUGHT</div>
          {cart.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>None yet — tap products to add.</div>
          ) : (
            <div className="cart-list">
              {cart.map((l) => (
                <div key={l.id} className="cart-line">
                  <div className="cart-line-main">
                    <span className="cart-line-name">{l.name}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{fmtBDT(l.price)} each</span>
                  </div>
                  <div className="qty-ctrl">
                    <button onClick={() => setQty(l.id, -1)}>−</button>
                    <span>{l.qty}</span>
                    <button onClick={() => setQty(l.id, +1)}>+</button>
                  </div>
                  <span className="cart-line-amt">{fmtBDT(l.price * l.qty)}</span>
                  <button className="cart-remove" onClick={() => removeLine(l.id)} title="Remove">×</button>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="order-total">
            <span>Total ({totalQty} item{totalQty === 1 ? '' : 's'})</span>
            <strong>{fmtBDT(subtotal)}</strong>
          </div>

          <button className="btn btn-primary confirm-btn" onClick={confirm} disabled={submitting}>
            {submitting ? 'Saving…' : 'Confirm sale'}
          </button>
        </aside>
      </div>

      {/* Success dialog */}
      {success && (
        <div className="dialog-overlay" onClick={() => setSuccess(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-check">✓</div>
            <h3 style={{ margin: '8px 0 4px' }}>Sale recorded</h3>
            <p className="muted" style={{ margin: 0 }}>
              {success.name} · {fmtBDT(success.total)}
            </p>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              It now appears in Home → Today's sales.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={() => setSuccess(null)}>
              New sale
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
