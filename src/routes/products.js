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

// Writes are wired to WooCommerce in the next step (Phase 3).
// Until then, manage products in WooCommerce directly.
function phase3(_req, res) {
  res.status(501).json({
    message: 'Product editing will be wired to WooCommerce next. For now, add/edit products in WooCommerce.',
  })
}
router.post('/', phase3)
router.put('/:id', phase3)
router.delete('/:id', phase3)

module.exports = router
