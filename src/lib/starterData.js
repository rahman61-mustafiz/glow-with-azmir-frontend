const Product = require('../models/Product')
const Advertise = require('../models/Advertise')
const Settings = require('../models/Settings')
const GalleryItem = require('../models/GalleryItem')
const LedgerEntry = require('../models/LedgerEntry')

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

async function seed({ force = false } = {}) {
  const count = await Product.countDocuments()
  if (count > 0 && !force) return false

  if (force) {
    await Promise.all([
      Product.deleteMany({}),
      GalleryItem.deleteMany({}),
      LedgerEntry.deleteMany({ saleId: null }),
      Advertise.deleteMany({}),
      Settings.deleteMany({}),
    ])
  }

  await Product.insertMany(PRODUCTS)
  await GalleryItem.insertMany(GALLERY.map((g) => ({ ...g, active: true })))
  await LedgerEntry.insertMany(ledgerSeed())
  if (!(await Advertise.findOne({ key: 'singleton' })))
    await Advertise.create({ key: 'singleton', videoUrl: '', description: ADVERTISE_DESC })
  if (!(await Settings.findOne({ key: 'singleton' })))
    await Settings.create({ key: 'singleton' })

  return true
}

module.exports = { seed, PRODUCTS, GALLERY, ADVERTISE_DESC }
