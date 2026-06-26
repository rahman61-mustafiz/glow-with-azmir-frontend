const { db } = require('../config/firebase')
const { serialize, now } = require('./util')

const col = db.collection('ledger')

// Sorted newest-first by createdAt (single-field index → no composite index needed).
async function list(limit = 200) {
  const snap = await col.orderBy('createdAt', 'desc').limit(limit).get()
  return snap.docs.map(serialize)
}

async function create({ type, category, note, amount, date }) {
  const ts = now()
  const ref = await col.add({
    type,
    category: category || '',
    note: note || '',
    amount: Number(amount),
    date: date || new Date().toISOString().slice(0, 10),
    saleId: null,
    createdAt: ts,
    updatedAt: ts,
  })
  return serialize(await ref.get())
}

async function remove(id) {
  const ref = col.doc(id)
  if (!(await ref.get()).exists) return false
  await ref.delete()
  return true
}

module.exports = { col, list, create, remove }
