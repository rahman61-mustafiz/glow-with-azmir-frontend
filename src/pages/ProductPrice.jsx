import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { PRODUCTS, fmtBDT } from '../data/products.js'

export default function ProductPrice() {
  return (
    <>
      <PageHeader
        title="Product price"
        subtitle="Manage products, buying & selling prices and stock levels."
        actions={
          <button className="btn btn-primary" type="button">
            + Add product
          </button>
        }
      />

      {/* Public-vs-admin notice */}
      <div
        className="card card-tint"
        style={{ marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start' }}
      >
        <span style={{ fontSize: 18 }}>🔒</span>
        <div style={{ fontSize: 13 }}>
          <strong>Buying price is admin-only.</strong> Only the{' '}
          <strong>selling price</strong> is uploaded to the public website. The buying
          price stays internal and feeds business accounting (stock value &amp; profit).
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>
                Buying price
                <span className="col-tag col-tag-admin">Admin only</span>
              </th>
              <th>
                Selling price
                <span className="col-tag col-tag-public">Public</span>
              </th>
              <th>Margin</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => {
              const margin = p.sellPrice - p.buyPrice
              return (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td className="muted">{p.sku}</td>
                  <td className="muted">{fmtBDT(p.buyPrice)}</td>
                  <td><strong>{fmtBDT(p.sellPrice)}</strong></td>
                  <td style={{ color: margin >= 0 ? '#1c7a3f' : '#9b1c1c' }}>
                    {fmtBDT(margin)}
                  </td>
                  <td>{p.stock}</td>
                  <td><StatusPill status={p.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" type="button" style={{ padding: '6px 12px' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
        {/* TODO(backend): wire products + pricing to the catalog API.
            Only sellPrice should be exposed on the public endpoint. */}
        Note: products are placeholder data — backend wiring pending.
      </p>
    </>
  )
}
