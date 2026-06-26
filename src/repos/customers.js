const { db } = require('../config/firebase')

const col = db.collection('customers')

// Type-ahead. Firestore has no substring/regex query, so we filter in memory
// (fine for a shop's customer count) to keep the exact "contains" behavior.
async function suggest(digits) {
  const q = String(digits || '').replace(/\D/g, '')
  if (q.length < 4) return []
  const snap = await col.get()
  return snap.docs
    .map((d) => d.data())
    .filter((c) => (c.phone || '').includes(q))
    .slice(0, 8)
    .map((c) => ({ name: c.name || '', phone: c.phone || '', lastItems: c.lastItems || [] }))
}

// Exact lookup. Customers are keyed by phone (doc id).
async function lookup(phone) {
  const p = String(phone)
  const d = await col.doc(p).get()
  if (!d.exists) return { found: false, name: '', phone: p, lastItems: [] }
  const c = d.data()
  return { found: true, name: c.name || '', phone: c.phone || p, lastItems: c.lastItems || [] }
}

module.exports = { suggest, lookup }
