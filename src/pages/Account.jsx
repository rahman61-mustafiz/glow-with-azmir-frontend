import PageHeader from '../components/PageHeader.jsx'

export default function Account() {
  return (
    <>
      <PageHeader
        title="Account"
        subtitle="Manage your admin profile and store details."
      />

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
        <div className="card">
          <h2 style={{ fontSize: 17 }}>Profile</h2>
          <label className="field">
            <span className="field-label">Full name</span>
            <input className="input" defaultValue="Azmir" placeholder="Your name" />
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input className="input" type="email" defaultValue="admin@glowwithazmir.com" />
          </label>
          <label className="field">
            <span className="field-label">Role</span>
            <input className="input" defaultValue="Administrator" disabled />
          </label>
          <button className="btn btn-primary" type="button">Save profile</button>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 17 }}>Store settings</h2>
          <label className="field">
            <span className="field-label">Store name</span>
            <input className="input" defaultValue="Glow with Azmir" />
          </label>
          <label className="field">
            <span className="field-label">Contact phone</span>
            <input className="input" placeholder="+880…" />
          </label>
          <label className="field">
            <span className="field-label">Currency</span>
            <input className="input" defaultValue="BDT (৳)" />
          </label>
          <button className="btn btn-ghost" type="button">Save settings</button>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
        {/* TODO(backend): wire profile + settings to the account API. */}
        Note: account forms are UI-only for now — backend wiring pending.
      </p>
    </>
  )
}
