const { db, FieldValue, Timestamp } = require('../config/firebase')
const { serialize, now } = require('./util')

const salesCol = db.collection('sales')
const productsCol = db.collection('products')
const ledgerCol = db.collection('ledger')
const customersCol = db.collection('customers')

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) }
}

async function listToday() {
  const { start, end } = todayRange()
  const snap = await salesCol
    .where('createdAt', '>=', start)
    .where('createdAt', '<', end)
    .orderBy('createdAt', 'desc')
    .get()
  return snap.docs.map(serialize)
}

async function listRecent(limit = 100) {
  const snap = await salesCol.orderBy('createdAt', 'desc').limit(limit).get()
  return snap.docs.map(serialize)
}

// Record a sale + decrement stock + log income + upsert customer, atomically.
// Customers are keyed by phone (doc id) so the upsert needs no query.
async function create({ customerName, customerPhone, items }) {
  const ts = now()
  const name = customerName.trim()
  const phone = (customerPhone || '').trim()
  const cleanItems = items.map((i) => ({
    productId: i.productId || null,
    name: i.name,
    qty: Number(i.qty) || 1,
    price: Number(i.price) || 0,
  }))
  const total = cleanItems.reduce((s, i) => s + i.qty * i.price, 0)
  const date = new Date().toISOString().slice(0, 10)

  const saleRef = salesCol.doc()
  const ledgerRef = ledgerCol.doc()

  await db.runTransaction(async (tx) => {
    // --- all reads first (Firestore transaction rule) ---
    const lines = cleanItems.filter((i) => i.productId).map((i) => ({ qty: i.qty, ref: productsCol.doc(i.productId) }))
    const snaps = await Promise.all(lines.map((l) => tx.get(l.ref)))

    // --- then writes ---
    tx.set(saleRef, { customerName: name, customerPhone: phone, items: cleanItems, total, createdAt: ts, updatedAt: ts })

    // Decrement stock only for products that exist (mirrors Mongo updateOne no-op).
    lines.forEach((l, idx) => {
      if (snaps[idx].exists) tx.update(l.ref, { stock: FieldValue.increment(-l.qty), updatedAt: ts })
    })

    tx.set(ledgerRef, {
      type: 'income',
      category: 'Product sales',
      note: `Sale to ${name}`,
      amount: total,
      date,
      saleId: saleRef.id,
      createdAt: ts,
      updatedAt: ts,
    })

    if (phone) {
      tx.set(
        customersCol.doc(phone),
        { phone, name, lastItems: cleanItems.map((i) => i.name), visitCount: FieldValue.increment(1), updatedAt: ts },
        { merge: true }
      )
    }
  })

  const iso = ts.toDate().toISOString()
  return { id: saleRef.id, customerName: name, customerPhone: phone, items: cleanItems, total, createdAt: iso, updatedAt: iso }
}

module.exports = { listToday, listRecent, create }
