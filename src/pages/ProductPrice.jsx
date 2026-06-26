import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { fmtBDT } from '../data/products.js'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products.js'

const EMPTY = { name: '', sku: '', category: '', buyPrice: 0, sellPrice: 0, stock: 0 }

export default function ProductPrice() {
  const [products, setProducts] = useState(null)
  const [editing, setEditing] = useState(null) // product object or {..EMPTY} for new
  const [err, setErr] = useState('')

  const load = () =>
    getProducts()
      .then(setProducts)
      .catch(() => setErr('Could not load products — is the backend running?'))

  useEffect(() => {
    load()
  }, [])

  async function save(form) {
    const payload = {
      name: form.name,
      sku: form.sku,
      category: form.category,
      buyPrice: Number(form.buyPrice) || 0,
      sellPrice: Number(form.sellPrice) || 0,
      stock: Number(form.stock) || 0,
    }
    if (form.id) await updateProduct(form.id, payload)
    else await createProduct(payload)
    setEditing(null)
    load()
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return
    await deleteProduct(p.id)
    load()
  }

  return (
    <>
      <PageHeader
        title="Product price"
        subtitle="Manage products, buying & selling prices and stock levels."
        actions={
          <button className="btn btn-primary" type="button" onClick={() => setEditing({ ...EMPTY })}>
            + Add product
          </button>
        }
      />

      <div
        className="card card-tint"
        style={{ marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start' }}
      >
        <span style={{ fontSize: 18 }}>🔒</span>
        <div style={{ fontSize: 13 }}>
          <strong>Buying price is admin-only.</strong> Only the <strong>selling price</strong> is
          uploaded to the public website. The buying price stays internal and feeds business
          accounting (stock value &amp; profit).
        </div>
      </div>

      {err && <div className="card" style={{ color: '#9b1c1c', marginBottom: 16 }}>{err}</div>}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Buying price<span className="col-tag col-tag-admin">Admin only</span></th>
              <th>Selling price<span className="col-tag col-tag-public">Public</span></th>
              <th>Margin</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!products ? (
              <tr><td colSpan={8} className="muted">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} className="muted">No products yet — add one.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td className="muted">{p.sku}</td>
                  <td className="muted">{fmtBDT(p.buyPrice)}</td>
                  <td><strong>{fmtBDT(p.sellPrice)}</strong></td>
                  <td style={{ color: p.sellPrice - p.buyPrice >= 0 ? '#1c7a3f' : '#9b1c1c' }}>
                    {fmtBDT(p.sellPrice - p.buyPrice)}
                  </td>
                  <td>{p.stock}</td>
                  <td><StatusPill status={p.status} /></td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setEditing(p)}>
                      Edit
                    </button>{' '}
                    <button className="btn btn-ghost" style={{ padding: '6px 10px', color: '#9b1c1c' }} onClick={() => remove(p)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && <ProductModal initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </>
  )
}

function ProductModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      alert('Save failed: ' + err.message)
      setSaving(false)
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <form className="dialog" style={{ maxWidth: 440, textAlign: 'left' }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 style={{ marginTop: 0 }}>{form.id ? 'Edit product' : 'Add product'}</h3>
        <label className="field"><span className="field-label">Name</span>
          <input className="input" value={form.name} onChange={set('name')} required /></label>
        <div className="row" style={{ gap: 10 }}>
          <label className="field" style={{ flex: 1 }}><span className="field-label">SKU</span>
            <input className="input" value={form.sku} onChange={set('sku')} /></label>
          <label className="field" style={{ flex: 1 }}><span className="field-label">Category</span>
            <input className="input" value={form.category} onChange={set('category')} /></label>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <label className="field" style={{ flex: 1 }}><span className="field-label">Buying price (admin)</span>
            <input className="input" type="number" min="0" value={form.buyPrice} onChange={set('buyPrice')} /></label>
          <label className="field" style={{ flex: 1 }}><span className="field-label">Selling price (public)</span>
            <input className="input" type="number" min="0" value={form.sellPrice} onChange={set('sellPrice')} /></label>
        </div>
        <label className="field"><span className="field-label">Stock</span>
          <input className="input" type="number" min="0" value={form.stock} onChange={set('stock')} /></label>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
