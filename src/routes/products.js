const router = require('express').Router()
const products = require('../repos/products')
const settings = require('../repos/settings')

// GET /api/products  — list all (admin view: includes buyPrice + status)
router.get('/', async (_req, res, next) => {
  try {
    const s = await settings.get()
    const list = await products.list()
    res.json(list.map((p) => products.withStatus(p, s.lowStockThreshold)))
  } catch (e) {
    next(e)
  }
})

// GET /api/products/public — public website view: only sellPrice exposed
router.get('/public', async (_req, res, next) => {
  try {
    const list = await products.list()
    res.json(list.map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.sellPrice })))
  } catch (e) {
    next(e)
  }
})

// POST /api/products — create
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.name) return res.status(400).json({ message: 'name is required' })
    const created = await products.create(req.body)
    const s = await settings.get()
    res.status(201).json(products.withStatus(created, s.lowStockThreshold))
  } catch (e) {
    next(e)
  }
})

// PUT /api/products/:id — update
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await products.update(req.params.id, req.body)
    if (!updated) return res.status(404).json({ message: 'Product not found' })
    const s = await settings.get()
    res.json(products.withStatus(updated, s.lowStockThreshold))
  } catch (e) {
    next(e)
  }
})

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await products.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Product not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
