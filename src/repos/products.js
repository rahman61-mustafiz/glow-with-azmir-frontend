const { db } = require('../config/firebase')
const { serialize, now } = require('./util')

const col = db.collection('products')

const NUMERIC = ['buyPrice', 'sellPrice', 'stock']

async function list() {
  const snap = await col.orderBy('createdAt', 'asc').get()
  return snap.docs.map(serialize)
}

async function get(id) {
  const d = await col.doc(id).get()
  return d.exists ? serialize(d) : null
}

async function create(data) {
  const ts = now()
  const ref = await col.add({
    name: data.name,
    sku: data.sku || '',
    category: data.category || 'Uncategorized',
    buyPrice: Number(data.buyPrice) || 0,
    sellPrice: Number(data.sellPrice) || 0,
    stock: Number(data.stock) || 0,
    createdAt: ts,
    updatedAt: ts,
  })
  return serialize(await ref.get())
}

async function update(id, data) {
  const ref = col.doc(id)
  if (!(await ref.get()).exists) return null
  const patch = { updatedAt: now() }
  for (const k of ['name', 'sku', 'category', ...NUMERIC]) {
    if (data[k] !== undefined) patch[k] = NUMERIC.includes(k) ? Number(data[k]) || 0 : data[k]
  }
  await ref.update(patch)
  return serialize(await ref.get())
}

async function remove(id) {
  const ref = col.doc(id)
  if (!(await ref.get()).exists) return false
  await ref.delete()
  return true
}

// Derive status the same way the Mongo version did (lib/settings.withStatus).
function withStatus(p, threshold) {
  return { ...p, status: p.stock <= threshold ? 'low' : 'active' }
}

module.exports = { col, list, get, create, update, remove, withStatus }
