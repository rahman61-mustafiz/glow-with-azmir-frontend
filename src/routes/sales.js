const router = require('express').Router()
const sales = require('../repos/wooSales') // sales = WooCommerce orders

// GET /api/sales/today — totals + feed for the dashboard (today's Woo orders)
router.get('/today', async (_req, res, next) => {
  try {
    const orders = await sales.listToday()
    const items = orders.map(sales.feedShape)
    res.json({
      total: orders.reduce((s, o) => s + (Number(o.total) || 0), 0),
      orders: orders.length,
      count: items.reduce((n, i) => n + i.qty, 0),
      items,
    })
  } catch (e) {
    next(e)
  }
})

// GET /api/sales — recent sales (recent Woo orders, mapped to the feed shape)
router.get('/', async (_req, res, next) => {
  try {
    const orders = await sales.listRecent(100)
    res.json(orders.map(sales.feedShape))
  } catch (e) {
    next(e)
  }
})

// POST /api/sales — record a sale = create a WooCommerce order
router.post('/', async (req, res, next) => {
  try {
    const { customerName, customerPhone, items } = req.body
    if (!customerName || !customerName.trim())
      return res.status(400).json({ message: 'customerName is required' })
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'items must be a non-empty array' })

    const sale = await sales.create({ customerName, customerPhone, items })
    res.status(201).json(sale)
  } catch (e) {
    next(e)
  }
})

module.exports = router
