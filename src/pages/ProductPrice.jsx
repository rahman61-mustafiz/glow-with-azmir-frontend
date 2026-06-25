import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'

const PRODUCTS = [
  { id: 1, name: 'Rose Glow Serum', sku: 'GWA-SER-01', price: 1450, stock: 32, status: 'active' },
  { id: 2, name: 'Velvet Matte Lipstick', sku: 'GWA-LIP-04', price: 690, stock: 5, status: 'low' },
  { id: 3, name: 'Golden Hour Highlighter', sku: 'GWA-HL-02', price: 980, stock: 3, status: 'low' },
  { id: 4, name: 'Silk Hair Oil', sku: 'GWA-HR-07', price: 1200, stock: 41, status: 'active' },
  { id: 5, name: 'Pearl Face Mask', sku: 'GWA-MSK-03', price: 540, stock: 60, status: 'active' },
]

const fmt = (n) => '৳ ' + n.toLocaleString('en-BD')

export default function ProductPrice() {
  return (
    <>
      <PageHeader
        title="Product price"
        subtitle="Manage products, pricing and stock levels."
        actions={
          <button className="btn btn-primary" type="button">
            + Add product
          </button>
        }
      />

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td className="muted">{p.sku}</td>
                <td>{fmt(p.price)}</td>
                <td>{p.stock}</td>
                <td><StatusPill status={p.status} /></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost" type="button" style={{ padding: '6px 12px' }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
        {/* TODO(backend): wire products + pricing to the catalog API. */}
        Note: products are placeholder data — backend wiring pending.
      </p>
    </>
  )
}
