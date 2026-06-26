const router = require('express').Router()
const Product = require('../models/Product')
const { getSettings, withStatus } = require('../lib/settings')

// GET /api/products  — list all (admin view: includes buyPrice)
router.get('/', async (_req, res, next) => {
  try {
    const settings = await getSettings()
    const products = await Product.find().sort({ createdAt: 1 })
    res.json(products.map((p) => withStatus(p, settings.lowStockThreshold)))
  } catch (e) {
    next(e)
  }
})

// GET /api/products/public — public website view: only sellPrice exposed
router.get('/public', async (_req, res, next) => {
  try {
    const products = await Product.find()
    res.json(
      products.map((p) => ({
        id: String(p._id),
        name: p.name,
        category: p.category,
        price: p.sellPrice, // NOTE: buyPrice intentionally omitted
      }))
    )
  } catch (e) {
    next(e)
  }
})

// POST /api/products — create
router.post('/', async (req, res, next) => {
  try {
    const { name, sku, category, buyPrice, sellPrice, stock } = req.body
    if (!name) return res.status(400).json({ message: 'name is required' })
    const product = await Product.create({ name, sku, category, buyPrice, sellPrice, stock })
    const settings = await getSettings()
    res.status(201).json(withStatus(product, settings.lowStockThreshold))
  } catch (e) {
    next(e)
  }
})

// PUT /api/products/:id — update
router.put('/:id', async (req, res, next) => {
  try {
    const { name, sku, category, buyPrice, sellPrice, stock } = req.body
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, sku, category, buyPrice, sellPrice, stock },
      { new: true, runValidators: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const settings = await getSettings()
    res.json(withStatus(product, settings.lowStockThreshold))
  } catch (e) {
    next(e)
  }
})

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await Product.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ message: 'Product not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
