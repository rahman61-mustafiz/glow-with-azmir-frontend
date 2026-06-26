const { db, Timestamp } = require('../config/firebase')

const PRODUCTS = [
  { name: 'Rose Glow Serum', sku: 'GWA-SER-01', category: 'Skincare', buyPrice: 900, sellPrice: 1450, stock: 32 },
  { name: 'Velvet Matte Lipstick', sku: 'GWA-LIP-04', category: 'Makeup', buyPrice: 380, sellPrice: 690, stock: 5 },
  { name: 'Golden Hour Highlighter', sku: 'GWA-HL-02', category: 'Makeup', buyPrice: 560, sellPrice: 980, stock: 3 },
  { name: 'Silk Hair Oil', sku: 'GWA-HR-07', category: 'Haircare', buyPrice: 720, sellPrice: 1200, stock: 41 },
  { name: 'Pearl Face Mask', sku: 'GWA-MSK-03', category: 'Skincare', buyPrice: 300, sellPrice: 540, stock: 60 },
]

const GALLERY = [
  { title: 'Rose Glow Serum', category: 'Skincare' },
  { title: 'Velvet Matte Lipstick', category: 'Makeup' },
  { title: 'Golden Hour Highlighter', category: 'Makeup' },
  { title: 'Silk Hair Oil', category: 'Haircare' },
  { title: 'Pearl Face Mask', category: 'Skincare' },
  { title: 'Summer Collection', category: 'Banner' },
]

const ADVERTISE_DESC =
  'Discover Glow with Azmir — premium beauty products crafted to make you shine. Watch our latest showcase.'

function ledgerSeed() {
  const today = new Date().toISOString().slice(0, 10)
  return [
    { type: 'expense', category: 'Stock purchase', note: 'Serum restock', amount: 18000, date: today },
    { type: 'expense', category: 'Rent', note: 'Shop rent', amount: 12000, date: today },
    { type: 'expense', category: 'Marketing', note: 'Ad boost', amount: 2500, date: today },
  ]
}

// Batch-delete every doc returned by a collection/query (handles >500 via chunks).
async function deleteAll(query) {
  const snap = await query.get()
  if (snap.empty) return
  let batch = db.batch()
  let n = 0
  for (const d of snap.docs) {
    batch.delete(d.ref)
    if (++n === 450) {
      await batch.commit()
      batch = db.batch()
      n = 0
    }
  }
  if (n > 0) await batch.commit()
}

// Seed starter data.
//   seed()             -> only seeds if products collection is empty (no-op otherwise)
//   seed({force:true}) -> clears products/gallery/seed-ledger + resets singletons, then re-seeds
// Sale-generated ledger entries (saleId != null) are preserved on a force reseed.
async function seed({ force = false } = {}) {
  const products = db.collection('products')
  const gallery = db.collection('gallery')
  const ledger = db.collection('ledger')

  const existing = await products.limit(1).get()
  if (!existing.empty && !force) return false

  if (force) {
    await deleteAll(products)
    await deleteAll(gallery)
    await deleteAll(ledger.where('saleId', '==', null))
  }

  // Stagger createdAt by index so list ordering is deterministic (matches array order).
  const base = Date.now()
  const stamp = (i) => Timestamp.fromMillis(base + i)

  const batch = db.batch()
  PRODUCTS.forEach((p, i) => {
    batch.set(products.doc(), { ...p, createdAt: stamp(i), updatedAt: stamp(i) })
  })
  GALLERY.forEach((g, i) => {
    batch.set(gallery.doc(), { title: g.title, category: g.category, imageUrl: '', active: true, createdAt: stamp(i), updatedAt: stamp(i) })
  })
  ledgerSeed().forEach((e, i) => {
    batch.set(ledger.doc(), { ...e, saleId: null, createdAt: stamp(i), updatedAt: stamp(i) })
  })
  const ts = stamp(0)
  batch.set(db.collection('advertise').doc('singleton'), { videoUrl: '', description: ADVERTISE_DESC, createdAt: ts, updatedAt: ts })
  batch.set(db.collection('settings').doc('singleton'), { storeName: 'Glow with Azmir', phone: '', currency: 'BDT (৳)', lowStockThreshold: 5, createdAt: ts, updatedAt: ts })

  await batch.commit()
  return true
}

module.exports = { seed, PRODUCTS, GALLERY, ADVERTISE_DESC }
