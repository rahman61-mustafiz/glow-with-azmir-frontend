const router = require('express').Router()
const products = require('../repos/wooProducts') // WooCommerce is the source of truth
const settings = require('../repos/settings')

// GET /api/products — list from WooCommerce (admin view: buyPrice + derived status)
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

// POST /api/products — publish a product into WooCommerce.
// Accepts the n8n/external body (snake_case) and the admin panel body (camelCase).
// Returns { ok, id, product } on success, or { ok:false, message } with a non-2xx
// status on failure, so external callers (n8n) can detect failures.
router.post('/', async (req, res) => {
  try {
    const b = req.body || {}
    if (!b.name || !String(b.name).trim()) {
      return res.status(400).json({ ok: false, message: 'name is required' })
    }
    const data = {
      name: b.name,
      sku: b.sku,
      category: b.category, // optional (panel)
      sellPrice: b.selling_price ?? b.sellPrice,
      buyPrice: b.buying_price ?? b.buyPrice,
      stock: b.stock,
      shortDescription: b.short_description ?? b.shortDescription,
      description: b.description,
      images: Array.isArray(b.images) ? b.images : undefined,
    }
    const created = await products.create(data) // status=publish, manage_stock=true
    const s = await settings.get()
    res.status(201).json({ ok: true, id: created.id, product: products.withStatus(created, s.lowStockThreshold) })
  } catch (e) {
    const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500
    res.status(status).json({ ok: false, message: e.message || 'Failed to create product' })
  }
})

// POST /api/products/republish-instock — publish every in-stock product that
// isn't published (rule: any product with stock >= 1 must be publicly visible).
router.post('/republish-instock', async (_req, res) => {
  try {
    const ids = await products.publishInStockDrafts()
    res.json({ ok: true, count: ids.length, publishedIds: ids })
  } catch (e) {
    res.status(e.status && e.status >= 400 && e.status < 600 ? e.status : 500).json({ ok: false, message: e.message })
  }
})

// PUT /api/products/:id — update in WooCommerce
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

// DELETE /api/products/:id — delete in WooCommerce
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
