// ============================================================
// Sales API — STUBS / PLACEHOLDERS
// ------------------------------------------------------------
// Powers the "Today's sales" view on the Home dashboard.
// The idea: when a customer buys a product, a new sale lands
// here so the admin sees a live/recent feed + today's total.
//
// Proposed real endpoints:
//   GET /api/sales/today    -> { total, count, items: [...] }
//   (later) a websocket / SSE stream for live updates
//
// TODO(backend): replace the mocked body with real calls.
// ============================================================

export async function getTodaySales() {
  // TODO(backend): replace with
  //   const res = await fetch('/api/sales/today')
  //   return res.json()
  await new Promise((r) => setTimeout(r, 300))

  const items = [
    { id: 'S-1042', product: 'Rose Glow Serum',         qty: 1, amount: 1450, time: '02:14 PM' },
    { id: 'S-1041', product: 'Velvet Matte Lipstick',   qty: 2, amount: 1380, time: '01:39 PM' },
    { id: 'S-1040', product: 'Silk Hair Oil',           qty: 1, amount: 1200, time: '12:55 PM' },
    { id: 'S-1039', product: 'Pearl Face Mask',         qty: 3, amount: 1620, time: '11:20 AM' },
    { id: 'S-1038', product: 'Golden Hour Highlighter', qty: 1, amount: 980,  time: '10:46 AM' },
  ]

  return {
    total: items.reduce((sum, i) => sum + i.amount, 0),
    count: items.reduce((sum, i) => sum + i.qty, 0),
    orders: items.length,
    items,
  }
}
