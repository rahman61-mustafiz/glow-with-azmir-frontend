// ============================================================
// Advertise API — STUBS / PLACEHOLDERS
// ------------------------------------------------------------
// The backend endpoint for the public website's home-page
// "Advertise" section is NOT built yet. These functions are
// intentionally faked so the UI is fully wired and we only
// have to swap the bodies once the API exists.
//
// Expected real endpoints (proposed):
//   GET  /api/advertise            -> { videoUrl, description, updatedAt }
//   PUT  /api/advertise            -> multipart/form-data { video?: File(.mp4), description: string }
//
// TODO(backend): replace the mocked bodies below with real fetch()
// calls once the endpoint is available. Search for "TODO(backend)".
// ============================================================

const STORAGE_KEY = 'gwa.advertise.draft'

/**
 * Load the current advertise content shown on the public home page.
 * @returns {Promise<{videoUrl: string|null, description: string, updatedAt: string|null}>}
 */
export async function getAdvertise() {
  // TODO(backend): replace with
  //   const res = await fetch('/api/advertise')
  //   return res.json()
  await fakeDelay()
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) return JSON.parse(cached)
  } catch {
    /* ignore */
  }
  return {
    videoUrl: null,
    description:
      'Discover Glow with Azmir — premium beauty products crafted to make you shine. Watch our latest showcase.',
    updatedAt: null,
  }
}

/**
 * Save the advertise content (video file + description).
 * @param {{ videoFile: File|null, description: string }} payload
 * @returns {Promise<{ ok: true, videoUrl: string|null, description: string, updatedAt: string }>}
 */
export async function saveAdvertise({ videoFile, description }) {
  // TODO(backend): replace with a multipart PUT, e.g.
  //   const fd = new FormData()
  //   if (videoFile) fd.append('video', videoFile)
  //   fd.append('description', description)
  //   const res = await fetch('/api/advertise', { method: 'PUT', body: fd })
  //   if (!res.ok) throw new Error('Failed to save advertise content')
  //   return res.json()
  await fakeDelay(900)

  // Mock: keep a local object URL so the preview keeps working in dev.
  const result = {
    ok: true,
    videoUrl: videoFile ? URL.createObjectURL(videoFile) : readCachedVideoUrl(),
    description,
    updatedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  } catch {
    /* ignore */
  }
  return result
}

function readCachedVideoUrl() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) return JSON.parse(cached).videoUrl ?? null
  } catch {
    /* ignore */
  }
  return null
}

function fakeDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
