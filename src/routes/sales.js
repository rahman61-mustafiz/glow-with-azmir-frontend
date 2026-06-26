const router = require('express').Router()
const sales = require('../repos/sales')

function fmtTime(d) {
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? 'AM' : 'PM'
  h = h % 12 === 0 ? 12 : h % 12
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`
}

function feedShape(sale) {
  const qty = sale.items.reduce((n, i) => n + i.qty, 0)
  const first = sale.items[0]?.name ?? '—'
  const extra = sale.items.length - 1
  return {
    id: sale.id,
    product: extra > 0 ? `${first} +${extra} more` : first,
    qty,
    amount: sale.total,
    time: fmtTime(new Date(sale.createdAt)),
  }
}

// GET /api/sales/today — totals + feed for the dashboard
router.get('/today', async (_req, res, next) => {
  try {
    const list = await sales.listToday()
    const items = list.map(feedShape)
    res.json({
      total: list.reduce((s, x) => s + x.total, 0),
      orders: list.length,
      count: items.reduce((n, i) => n + i.qty, 0),
      items,
    })
  } catch (e) {
    next(e)
  }
})

// GET /api/sales — recent sales (last 100)
router.get('/', async (_req, res, next) => {
  try {
    res.json(await sales.listRecent(100))
  } catch (e) {
    next(e)
  }
})

// POST /api/sales — record a sale (tablet / sales-entry tab)
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
