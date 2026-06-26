const router = require('express').Router()
const Sale = require('../models/Sale')
const Product = require('../models/Product')
const Customer = require('../models/Customer')
const LedgerEntry = require('../models/LedgerEntry')

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

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
    id: String(sale._id),
    product: extra > 0 ? `${first} +${extra} more` : first,
    qty,
    amount: sale.total,
    time: fmtTime(new Date(sale.createdAt)),
  }
}

// GET /api/sales/today — totals + feed for the dashboard
router.get('/today', async (_req, res, next) => {
  try {
    const { start, end } = todayRange()
    const sales = await Sale.find({ createdAt: { $gte: start, $lt: end } }).sort({ createdAt: -1 })
    const items = sales.map(feedShape)
    res.json({
      total: sales.reduce((s, x) => s + x.total, 0),
      orders: sales.length,
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
    const sales = await Sale.find().sort({ createdAt: -1 }).limit(100)
    res.json(sales.map((s) => ({ ...s.toObject(), id: String(s._id) })))
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

    const cleanItems = items.map((i) => ({
      productId: i.productId || undefined,
      name: i.name,
      qty: Number(i.qty) || 1,
      price: Number(i.price) || 0,
    }))
    const total = cleanItems.reduce((s, i) => s + i.qty * i.price, 0)

    const sale = await Sale.create({
      customerName: customerName.trim(),
      customerPhone: (customerPhone || '').trim(),
      items: cleanItems,
      total,
    })

    // Decrement stock for any line tied to a product.
    await Promise.all(
      cleanItems
        .filter((i) => i.productId)
        .map((i) =>
          Product.updateOne({ _id: i.productId }, { $inc: { stock: -i.qty } })
        )
    )

    // Record income in the ledger (so Accounting reflects the sale).
    const date = new Date().toISOString().slice(0, 10)
    await LedgerEntry.create({
      type: 'income',
      category: 'Product sales',
      note: `Sale to ${sale.customerName}`,
      amount: total,
      date,
      saleId: sale._id,
    })

    // Upsert the customer (for phone type-ahead / returning lookup).
    if (sale.customerPhone) {
      await Customer.findOneAndUpdate(
        { phone: sale.customerPhone },
        {
          $set: { name: sale.customerName, lastItems: cleanItems.map((i) => i.name) },
          $inc: { visitCount: 1 },
        },
        { upsert: true, new: true }
      )
    }

    res.status(201).json({ ...sale.toObject(), id: String(sale._id) })
  } catch (e) {
    next(e)
  }
})

module.exports = router
