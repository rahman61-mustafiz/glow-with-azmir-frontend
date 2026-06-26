import { useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { getGallery, addGalleryItem, deleteGalleryItem } from '../api/gallery.js'

export default function Gallery() {
  const [items, setItems] = useState(null)
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')

  const load = () =>
    getGallery()
      .then(setItems)
      .catch(() => setErr('Could not load gallery — is the backend running?'))

  useEffect(() => {
    load()
  }, [])

  async function remove(id) {
    if (!confirm('Delete this image?')) return
    await deleteGalleryItem(id)
    load()
  }

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Curate the images shown across the storefront."
        actions={<button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>+ Add image</button>}
      />

      {err && <div className="card" style={{ color: '#9b1c1c', marginBottom: 16 }}>{err}</div>}

      {!items ? (
        <div className="card muted">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card muted">No images yet — add one.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: 14 }}>
              <div
                style={{
                  height: 140,
                  borderRadius: 10,
                  background: item.imageUrl
                    ? `center/cover no-repeat url(${item.imageUrl})`
                    : 'linear-gradient(135deg, var(--gold-tint), #efe3c4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-dark)',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {!item.imageUrl && '✦ Image'}
              </div>
              <div className="spread">
                <strong style={{ fontSize: 14 }}>{item.title || 'Untitled'}</strong>
                <StatusPill status={item.active ? 'active' : 'low'} />
              </div>
              <div className="spread" style={{ marginTop: 4 }}>
                <span className="muted" style={{ fontSize: 12 }}>{item.category}</span>
                <button className="btn btn-ghost" style={{ padding: '4px 9px', color: '#9b1c1c' }} onClick={() => remove(item.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && <GalleryModal onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load() }} />}
    </>
  )
}

function GalleryModal({ onClose, onSaved }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addGalleryItem({ title, category, imageFile: file })
      onSaved()
    } catch (err) {
      alert('Upload failed: ' + err.message)
      setSaving(false)
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <form className="dialog" style={{ maxWidth: 420, textAlign: 'left' }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 style={{ marginTop: 0 }}>Add gallery image</h3>
        <label className="field"><span className="field-label">Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span className="field-label">Category</span>
          <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Skincare, Banner" /></label>
        <label className="field"><span className="field-label">Image file</span>
          <input ref={fileRef} className="input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Uploading…' : 'Add image'}</button>
        </div>
      </form>
    </div>
  )
}
