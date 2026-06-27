import { useEffect, useMemo, useRef, useState } from 'react'
import { fmtBDT } from '../data/products.js'
import { recordSale } from '../api/sales.js'
import { getProducts } from '../api/products.js'
import { suggestCustomers, lookupCustomer } from '../api/customers.js'
import './sales-entry.css'

// Staff / tablet SELLING screen. OPEN (no passcode) and standalone — shows only
// the product grid, search/filter, and the sell flow. NO accounting figures
// (revenue / profit / totals) and NO links into the admin area.

export default function SalesEntry() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null) // null = All
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([]) // [{ id, name, price, qty }]

  // Load products from the backend.
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  )

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [customer, setCustomer] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const phoneTimer = useRef(null)

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
    return products.filter((p) => {
      const inCat = !category || p.category === category
      const inSearch = !q || p.name.toLowerCase().includes(q)
      return inCat && inSearch
    })
  }, [products, category, search])

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
      const sale = await recordSale({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        items: cart.map((l) => ({ productId: l.id, name: l.name, qty: l.qty, price: l.price })),
      })
      setSuccess(sale)
      resetForm()
    } catch (e) {
      alert('Could not save sale: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const qtyInCart = (id) => cart.find((l) => l.id === id)?.qty ?? 0

  return (
    <div className="sales-page">
      {/* Standalone top bar — no admin navigation */}
      <header className="sales-topbar">
        <span className="sales-wordmark">
          <span className="wordmark-mark">✦</span> Glow with Azmir
        </span>
        <span className="sales-badge">Sales</span>
      </header>

      <div className="sales">
        {/* Header */}
        <div className="sales-head">
          <div>
            <h1>Sell</h1>
            <p className="muted">Tap products, add the customer, and confirm the sale.</p>
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
            <span className="cat-count">{products.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={'cat-tile' + (category === c ? ' is-active' : '')}
              onClick={() => setCategory(c)}
            >
              <span>{c}</span>
              <span className="cat-count">{products.filter((p) => p.category === c).length}</span>
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
                  <span className="prod-image">
                    {p.image ? (
                      <img src={p.image} alt={p.name} loading="lazy" />
                    ) : (
                      <span className="prod-image-ph">✦</span>
                    )}
                  </span>
                  <span className="prod-name">{p.name}</span>
                  {p.description && <span className="prod-desc">{p.description}</span>}
                  {p.sku && <span className="prod-sku">SKU: {p.sku}</span>}
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
              {success.customerName} · {fmtBDT(success.total)}
            </p>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Stock updated.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={() => setSuccess(null)}>
              New sale
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
