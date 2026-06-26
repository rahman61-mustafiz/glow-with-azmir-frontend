// ============================================================
// Sales API — STUBS / PLACEHOLDERS
// ------------------------------------------------------------
// Powers the "Today's sales" view on the Home dashboard and the
// "Sales entry" tab. Currently backed by a client-side store
// (src/data/salesStore.js) so the UI is fully functional offline.
//
// Proposed real endpoints:
//   GET  /api/sales/today    -> { total, count, orders, items: [...] }
//   POST /api/sales          -> record a sale
//   (later) a websocket / SSE stream for live updates
//
// TODO(backend): replace the bodies below with real calls.
// ============================================================

import { getToday, addSale } from '../data/salesStore.js'

export async function getTodaySales() {
  // TODO(backend): const res = await fetch('/api/sales/today'); return res.json()
  await new Promise((r) => setTimeout(r, 150))
  return getToday()
}

export async function recordSale({ customerName, customerPhone, items }) {
  // TODO(backend): POST to /api/sales instead of the local store.
  await new Promise((r) => setTimeout(r, 350))
  return addSale({ customerName, customerPhone, items })
}
