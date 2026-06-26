const { db } = require('../config/firebase')
const { now } = require('./util')

// Singleton document.
const ref = db.collection('settings').doc('singleton')

const DEFAULTS = { storeName: 'Glow with Azmir', phone: '', currency: 'BDT (৳)', lowStockThreshold: 5 }

const shape = (data) => ({
  storeName: data.storeName ?? DEFAULTS.storeName,
  phone: data.phone ?? DEFAULTS.phone,
  currency: data.currency ?? DEFAULTS.currency,
  lowStockThreshold: data.lowStockThreshold ?? DEFAULTS.lowStockThreshold,
})

async function get() {
  const d = await ref.get()
  if (!d.exists) {
    const ts = now()
    await ref.set({ ...DEFAULTS, createdAt: ts, updatedAt: ts })
    return { ...DEFAULTS }
  }
  return shape(d.data())
}

async function update(fields) {
  const patch = { updatedAt: now() }
  for (const k of ['storeName', 'phone', 'currency', 'lowStockThreshold']) {
    if (fields[k] !== undefined) patch[k] = k === 'lowStockThreshold' ? Number(fields[k]) : fields[k]
  }
  await ref.set(patch, { merge: true })
  return get()
}

module.exports = { get, update }
