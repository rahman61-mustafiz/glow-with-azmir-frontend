import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { fmtBDT } from '../data/products.js'
import { getAccountingSummary } from '../api/accounting.js'

export default function Accounting() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAccountingSummary()
      .then((d) => active && setData(d))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading || !data) {
    return (
      <>
        <PageHeader title="Accounting" />
        <div className="card muted">Loading business accounts…</div>
      </>
    )
  }

  const cards = [
    { label: 'Total income', value: fmtBDT(data.income), tone: 'pos' },
    { label: 'Total expenses', value: fmtBDT(data.expenses), tone: 'neg' },
    { label: 'Net profit', value: fmtBDT(data.profit), tone: data.profit >= 0 ? 'pos' : 'neg' },
    { label: 'Stock value (at cost)', value: fmtBDT(data.stockValueCost), tone: 'neutral' },
  ]

  return (
    <>
      <PageHeader
        title="Accounting"
        subtitle="Business bookkeeping — income, expenses, profit and current stock value."
        actions={
          <button className="btn btn-primary" type="button">
            + Add entry
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
              {c.label}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                marginTop: 6,
                color:
                  c.tone === 'pos'
                    ? '#1c7a3f'
                    : c.tone === 'neg'
                    ? '#9b1c1c'
                    : 'var(--black)',
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Stock-tied panel */}
      <div
        className="grid"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', marginTop: 20 }}
      >
        <div className="card card-tint">
          <h2 style={{ fontSize: 17 }}>Inventory snapshot</h2>
          <div className="spread" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="muted">Units on hand</span>
            <strong>{data.unitsOnHand}</strong>
          </div>
          <div className="spread" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="muted">Stock value (cost / buying price)</span>
            <strong>{fmtBDT(data.stockValueCost)}</strong>
          </div>
          <div className="spread" style={{ padding: '10px 0' }}>
            <span className="muted">Stock value (retail / selling price)</span>
            <strong>{fmtBDT(data.stockValueRetail)}</strong>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Stock value is derived from product buying prices in the Product price tab.
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 17 }}>Profit breakdown</h2>
          <div className="spread" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="muted">Income</span>
            <strong style={{ color: '#1c7a3f' }}>{fmtBDT(data.income)}</strong>
          </div>
          <div className="spread" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="muted">Expenses</span>
            <strong style={{ color: '#9b1c1c' }}>− {fmtBDT(data.expenses)}</strong>
          </div>
          <div className="spread" style={{ padding: '10px 0' }}>
            <strong>Net profit</strong>
            <strong>{fmtBDT(data.profit)}</strong>
          </div>
        </div>
      </div>

      {/* Ledger */}
      <h2 style={{ marginTop: 30, fontSize: 18 }}>Ledger</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((e) => (
              <tr key={e.id}>
                <td className="muted">{e.date}</td>
                <td><strong>{e.category}</strong></td>
                <td className="muted">{e.note}</td>
                <td>
                  <span className={'pill ' + (e.type === 'income' ? 'pill-active' : 'pill-low')}>
                    {e.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontWeight: 700,
                    color: e.type === 'income' ? '#1c7a3f' : '#9b1c1c',
                  }}
                >
                  {e.type === 'income' ? '+ ' : '− '}
                  {fmtBDT(e.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
        {/* TODO(backend): wire to GET /api/accounting/summary. */}
        Note: accounting figures are stubbed data — backend wiring pending.
      </p>
    </>
  )
}
