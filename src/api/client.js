// Central API client for the Glow with Azmir backend.
// Base URL comes from VITE_API_BASE (see .env). Optional VITE_API_KEY is sent
// as x-api-key for write requests when the backend is run in protected mode.

const BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:4000/api').replace(/\/$/, '')
const KEY = import.meta.env.VITE_API_KEY || ''

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  if (KEY) headers['x-api-key'] = KEY

  let payload
  if (form) {
    payload = form // FormData — let the browser set the content-type/boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      message = (await res.json()).message || message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  base: BASE,
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  postForm: (p, form) => request(p, { method: 'POST', form }),
  putForm: (p, form) => request(p, { method: 'PUT', form }),
}
