// ============================================================
// Sales store — CLIENT-SIDE STUB
// ------------------------------------------------------------
// A tiny localStorage-backed store so that a sale entered on the
// "Sales entry" tab immediately shows up in Home -> Today's sales.
// This mimics the future flow: tablet records a sale -> backend ->
// dashboard updates live.
//
// TODO(backend): replace this whole module with real API calls:
//   POST /api/sales            (record a sale)
//   GET  /api/sales/today      (today's list + totals)
//   + a websocket/SSE stream so the dashboard updates in real time.
// ============================================================

const KEY = 'gwa.sales.v1'
const listeners = new Set()

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

function fmtTime(ts) {
  const d = new Date(ts)
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? 'AM' : 'PM'
  h = h % 12 === 0 ? 12 : h % 12
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

function write(sales) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sales))
  } catch {
    /* ignore */
  }
  listeners.forEach((cb) => cb())
}

// Seed a few of today's sales on first load so the dashboard isn't empty.
function seed() {
  const now = Date.now()
  const mk = (n, name, qty, amount, minsAgo) => ({
    id: 'S-' + (1040 + n),
    name,
    phone: '',
    items: [{ name, qty, price: Math.round(amount / qty) }],
    total: amount,
    ts: now - minsAgo * 60 * 1000,
  })
  return [
    mk(2, 'Rose Glow Serum', 1, 1450, 12),
    mk(1, 'Velvet Matte Lipstick', 2, 1380, 47),
    mk(0, 'Silk Hair Oil', 1, 1200, 95),
  ]
}

function all() {
  let sales = read()
  if (!sales) {
    sales = seed()
    write(sales)
  }
  return sales
}

/** Subscribe to store changes. Returns an unsubscribe function. */
export function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Record a new sale. `sale` = { customerName, customerPhone, items:[{name, qty, price}] }. */
export function addSale({ customerName, customerPhone, items }) {
  const sales = all()
  const total = items.reduce((s, i) => s + i.qty * i.price, 0)
  const seq = sales.length + 1041
  const sale = {
    id: 'S-' + seq,
    name: customerName,
    phone: customerPhone || '',
    items,
    total,
    ts: Date.now(),
  }
  write([sale, ...sales])
  return sale
}

/** Today's sales + derived totals, shaped for the Today's sales feed. */
export function getToday() {
  const tk = todayKey()
  const sales = all().filter((s) => todayKey(new Date(s.ts)) === tk)

  const items = sales.map((s) => {
    const qty = s.items.reduce((n, i) => n + i.qty, 0)
    const first = s.items[0]?.name ?? '—'
    const extra = s.items.length - 1
    return {
      id: s.id,
      product: extra > 0 ? `${first} +${extra} more` : first,
      qty,
      amount: s.total,
      time: fmtTime(s.ts),
    }
  })

  return {
    total: sales.reduce((s, x) => s + x.total, 0),
    orders: sales.length,
    count: items.reduce((n, i) => n + i.qty, 0),
    items,
  }
}
