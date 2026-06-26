import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { fmtBDT } from '../data/products.js'
import { getAccountingSummary, addLedgerEntry, deleteLedgerEntry } from '../api/accounting.js'

const EMPTY = { type: 'expense', category: '', note: '', amount: '', date: '' }

export default function Accounting() {
  const [data, setData] = useState(null)
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')

  const load = () =>
    getAccountingSummary()
      .then(setData)
      .catch(() => setErr('Could not load accounts — is the backend running?'))

  useEffect(() => {
    load()
  }, [])

  async function save(form) {
    await addLedgerEntry({
      type: form.type,
      category: form.category,
      note: form.note,
      amount: Number(form.amount) || 0,
      date: form.date || undefined,
    })
    setAdding(false)
    load()
  }

  async function remove(id) {
    if (!confirm('Delete this entry?')) return
    await deleteLedgerEntry(id)
    load()
  }

  if (err) return (<><PageHeader title="Accounting" /><div className="card" style={{ color: '#9b1c1c' }}>{err}</div></>)
  if (!data) return (<><PageHeader title="Accounting" /><div className="card muted">Loading business accounts…</div></>)

  const cards = [
    { label: 'Total income', value: fmtBDT(data.income), tone: 'pos' },
    { label: 'Total expenses', value: fmtBDT(data.expenses), tone: 'neg' },
    { label: 'Net profit', value: fmtBDT(data.profit), tone: data.profit >= 0 ? 'pos' : 'neg' },
    { label: 'Stock value (at cost)', value: fmtBDT(data.stockValueCost), tone: 'neutral' },
  ]
  const color = (t) => (t === 'pos' ? '#1c7a3f' : t === 'neg' ? '#9b1c1c' : 'var(--black)')

  return (
    <>
      <PageHeader
        title="Accounting"
        subtitle="Business bookkeeping — income, expenses, profit and current stock value."
        actions={<button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>+ Add entry</button>}
      />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: color(c.tone) }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', marginTop: 20 }}>
        <div className="card card-tint">
          <h2 style={{ fontSize: 17 }}>Inventory snapshot</h2>
          <Row label="Units on hand" value={data.unitsOnHand} border />
          <Row label="Stock value (cost / buying price)" value={fmtBDT(data.stockValueCost)} border />
          <Row label="Stock value (retail / selling price)" value={fmtBDT(data.stockValueRetail)} />
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Stock value is derived from product buying prices in the Product price tab.
          </p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 17 }}>Profit breakdown</h2>
          <Row label="Income" value={fmtBDT(data.income)} valueColor="#1c7a3f" border />
          <Row label="Expenses" value={'− ' + fmtBDT(data.expenses)} valueColor="#9b1c1c" border />
          <Row label="Net profit" value={fmtBDT(data.profit)} bold />
        </div>
      </div>

      <h2 style={{ marginTop: 30, fontSize: 18 }}>Ledger</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Date</th><th>Category</th><th>Note</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th><th></th></tr>
          </thead>
          <tbody>
            {data.entries.length === 0 ? (
              <tr><td colSpan={6} className="muted">No entries yet.</td></tr>
            ) : (
              data.entries.map((e) => (
                <tr key={e.id}>
                  <td className="muted">{e.date}</td>
                  <td><strong>{e.category}</strong></td>
                  <td className="muted">{e.note}</td>
                  <td><span className={'pill ' + (e.type === 'income' ? 'pill-active' : 'pill-low')}>{e.type === 'income' ? 'Income' : 'Expense'}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: e.type === 'income' ? '#1c7a3f' : '#9b1c1c' }}>
                    {e.type === 'income' ? '+ ' : '− '}{fmtBDT(e.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 9px', color: '#9b1c1c' }} onClick={() => remove(e.id)}>✕</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {adding && <EntryModal onClose={() => setAdding(false)} onSave={save} />}
    </>
  )
}

function Row({ label, value, valueColor, border, bold }) {
  return (
    <div className="spread" style={{ padding: '10px 0', borderBottom: border ? '1px solid var(--border)' : 'none' }}>
      <span className={bold ? '' : 'muted'} style={bold ? { fontWeight: 700 } : undefined}>{label}</span>
      <strong style={valueColor ? { color: valueColor } : undefined}>{value}</strong>
    </div>
  )
}

function EntryModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try { await onSave(form) } catch (err) { alert('Save failed: ' + err.message); setSaving(false) }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <form className="dialog" style={{ maxWidth: 420, textAlign: 'left' }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 style={{ marginTop: 0 }}>Add ledger entry</h3>
        <label className="field"><span className="field-label">Type</span>
          <select className="input" value={form.type} onChange={set('type')}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label className="field"><span className="field-label">Category</span>
          <input className="input" value={form.category} onChange={set('category')} placeholder="e.g. Rent, Stock purchase, Product sales" /></label>
        <label className="field"><span className="field-label">Note</span>
          <input className="input" value={form.note} onChange={set('note')} /></label>
        <div className="row" style={{ gap: 10 }}>
          <label className="field" style={{ flex: 1 }}><span className="field-label">Amount (৳)</span>
            <input className="input" type="number" min="0" value={form.amount} onChange={set('amount')} required /></label>
          <label className="field" style={{ flex: 1 }}><span className="field-label">Date</span>
            <input className="input" type="date" value={form.date} onChange={set('date')} /></label>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add entry'}</button>
        </div>
      </form>
    </div>
  )
}
