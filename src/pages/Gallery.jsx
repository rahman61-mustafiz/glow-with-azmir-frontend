import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'

const ITEMS = [
  { id: 1, title: 'Rose Glow Serum', tag: 'Skincare', status: 'active' },
  { id: 2, title: 'Velvet Matte Lipstick', tag: 'Makeup', status: 'active' },
  { id: 3, title: 'Golden Hour Highlighter', tag: 'Makeup', status: 'low' },
  { id: 4, title: 'Silk Hair Oil', tag: 'Haircare', status: 'active' },
  { id: 5, title: 'Pearl Face Mask', tag: 'Skincare', status: 'active' },
  { id: 6, title: 'Summer Collection', tag: 'Banner', status: 'active' },
]

export default function Gallery() {
  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Curate the images shown across the storefront."
        actions={
          <button className="btn btn-primary" type="button">
            + Add image
          </button>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
      >
        {ITEMS.map((item) => (
          <div key={item.id} className="card" style={{ padding: 14 }}>
            <div
              style={{
                height: 140,
                borderRadius: 10,
                background:
                  'linear-gradient(135deg, var(--gold-tint), #efe3c4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-dark)',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              ✦ Image
            </div>
            <div className="spread">
              <strong style={{ fontSize: 14 }}>{item.title}</strong>
              <StatusPill status={item.status} />
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {item.tag}
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
        {/* TODO(backend): wire gallery items to the media API. */}
        Note: gallery items are placeholder data — backend wiring pending.
      </p>
    </>
  )
}
