const router = require('express').Router()
const ledger = require('../repos/ledger')
const products = require('../repos/wooProducts') // stock value derived from WooCommerce

// GET /api/accounting/summary
router.get('/summary', async (_req, res, next) => {
  try {
    const entries = await ledger.list(200)
    const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

    const prods = await products.list()
    const unitsOnHand = prods.reduce((s, p) => s + p.stock, 0)
    const stockValueCost = prods.reduce((s, p) => s + p.stock * p.buyPrice, 0)
    const stockValueRetail = prods.reduce((s, p) => s + p.stock * p.sellPrice, 0)

    res.json({
      income,
      expenses,
      profit: income - expenses,
      unitsOnHand,
      stockValueCost,
      stockValueRetail,
      entries,
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/accounting/entries — add an income/expense entry
router.post('/entries', async (req, res, next) => {
  try {
    const { type, amount } = req.body
    if (!['income', 'expense'].includes(type))
      return res.status(400).json({ message: "type must be 'income' or 'expense'" })
    if (!(Number(amount) >= 0)) return res.status(400).json({ message: 'amount is required' })
    res.status(201).json(await ledger.create(req.body))
  } catch (e) {
    next(e)
  }
})

// DELETE /api/accounting/entries/:id
router.delete('/entries/:id', async (req, res, next) => {
  try {
    const ok = await ledger.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Entry not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
