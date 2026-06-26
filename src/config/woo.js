// WooCommerce REST API client.
// Auth = Basic (consumer key:secret) over HTTPS. Credentials come from env:
//   WOO_URL    e.g. https://glowwithazmir.com
//   WOO_KEY    consumer key  (ck_…)
//   WOO_SECRET consumer secret (cs_…)

const BASE = (process.env.WOO_URL || '').replace(/\/$/, '') + '/wp-json/wc/v3'
const KEY = process.env.WOO_KEY || ''
const SECRET = process.env.WOO_SECRET || ''
const AUTH = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64')

function configured() {
  return !!(process.env.WOO_URL && KEY && SECRET)
}

async function wooRequest(path, { method = 'GET', body, query } = {}) {
  if (!configured()) {
    const e = new Error('WooCommerce is not configured (set WOO_URL, WOO_KEY, WOO_SECRET).')
    e.status = 503
    throw e
  }
  let url = BASE + path
  if (query) {
    const qs = new URLSearchParams(query).toString()
    url += (url.includes('?') ? '&' : '?') + qs
  }
  const headers = { Authorization: AUTH, Accept: 'application/json' }
  let payload
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  const res = await fetch(url, { method, headers, body: payload })
  if (!res.ok) {
    let message = `WooCommerce request failed (${res.status})`
    try {
      const j = await res.json()
      if (j && j.message) message = j.message
    } catch {
      /* ignore */
    }
    const e = new Error(message)
    e.status = res.status
    throw e
  }
  if (res.status === 204) return null
  return res.json()
}

module.exports = { wooRequest, configured }
