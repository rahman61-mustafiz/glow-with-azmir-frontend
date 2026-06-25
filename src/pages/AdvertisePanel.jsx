import { useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { getAdvertise, saveAdvertise } from '../api/advertise.js'
import './advertise.css'

// This tab controls the "Advertise" section on the PUBLIC website home page.
// The admin can change exactly two things:
//   1) a video  (.mp4 upload)
//   2) a description (text)

const MAX_MB = 50

export default function AdvertisePanel() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  // Form state
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null) // newly selected File (not yet saved)
  const [videoUrl, setVideoUrl] = useState(null) // currently-published / preview URL
  const [fileName, setFileName] = useState('')

  const fileInputRef = useRef(null)

  // Load existing advertise content on mount.
  useEffect(() => {
    let active = true
    getAdvertise()
      .then((data) => {
        if (!active) return
        setDescription(data.description ?? '')
        setVideoUrl(data.videoUrl ?? null)
        setSavedAt(data.updatedAt ?? null)
      })
      .catch(() => active && setError('Could not load current advertise content.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  function handleFileChange(e) {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    // Must accept ONLY .mp4
    const isMp4 =
      file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
    if (!isMp4) {
      setError('Only .mp4 video files are allowed.')
      resetFileInput()
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Video is too large. Max ${MAX_MB} MB.`)
      resetFileInput()
      return
    }

    setVideoFile(file)
    setFileName(file.name)
    setVideoUrl(URL.createObjectURL(file)) // local preview
  }

  function resetFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleRemoveVideo() {
    setVideoFile(null)
    setFileName('')
    setVideoUrl(null)
    resetFileInput()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // TODO(backend): saveAdvertise is a STUB — see src/api/advertise.js
      const res = await saveAdvertise({ videoFile, description })
      setVideoUrl(res.videoUrl)
      setVideoFile(null)
      setSavedAt(res.updatedAt)
    } catch (err) {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Advertise panel" />
        <div className="card muted">Loading current advertise content…</div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Advertise panel"
        subtitle="Controls the Advertise section on the public website home page."
        actions={<StatusPill status={videoUrl ? 'active' : 'low'} />}
      />

      <div className="advertise-grid">
        {/* ---------- Editor ---------- */}
        <form className="card" onSubmit={handleSubmit}>
          <h2 style={{ fontSize: 17 }}>Edit advertise content</h2>
          <p className="muted" style={{ marginTop: -2, marginBottom: 18, fontSize: 13 }}>
            These two fields are what visitors see on the home page.
          </p>

          {/* Video upload (.mp4 only) */}
          <div className="field">
            <span className="field-label">Advertise video (.mp4)</span>

            <input
              ref={fileInputRef}
              id="adv-video"
              type="file"
              accept="video/mp4,.mp4"
              onChange={handleFileChange}
              hidden
            />

            <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">⬆</div>
              <div>
                <strong>{fileName || 'Click to upload an .mp4 video'}</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  MP4 only · max {MAX_MB} MB
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose file
              </button>
              {(videoFile || videoUrl) && (
                <button type="button" className="btn btn-ghost" onClick={handleRemoveVideo}>
                  Remove video
                </button>
              )}
            </div>
            <div className="field-hint">
              {videoFile
                ? 'New video selected — click Save to publish.'
                : 'Upload replaces the current home-page video.'}
            </div>
          </div>

          {/* Description */}
          <label className="field" htmlFor="adv-desc">
            <span className="field-label">Description</span>
            <textarea
              id="adv-desc"
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the text shown beside / below the advertise video…"
              maxLength={600}
            />
            <div className="field-hint">{description.length}/600 characters</div>
          </label>

          {error && <div className="alert-error">{error}</div>}

          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save & publish'}
            </button>
            {savedAt && (
              <span className="muted" style={{ fontSize: 12 }}>
                Last updated {new Date(savedAt).toLocaleString()}
              </span>
            )}
          </div>
        </form>

        {/* ---------- Live preview ---------- */}
        <div className="card card-tint">
          <div className="spread" style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, margin: 0 }}>Home-page preview</h2>
            <span className="muted" style={{ fontSize: 12 }}>How it appears to visitors</span>
          </div>

          <div className="preview-frame">
            {videoUrl ? (
              <video src={videoUrl} controls className="preview-video" />
            ) : (
              <div className="preview-placeholder">
                <div style={{ fontSize: 28 }}>🎬</div>
                <div>No video yet — upload an .mp4 to preview.</div>
              </div>
            )}
            <p className="preview-desc">
              {description || 'Your description will appear here.'}
            </p>
          </div>

          <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>
            {/* TODO(backend): this preview mirrors what the public site will render
                from GET /api/advertise once the endpoint exists. */}
            Preview is rendered from the current form — the public site will read
            the same data from the advertise API.
          </p>
        </div>
      </div>
    </>
  )
}
