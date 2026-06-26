const router = require('express').Router()
const LedgerEntry = require('../models/LedgerEntry')
const Product = require('../models/Product')

// GET /api/accounting/summary
router.get('/summary', async (_req, res, next) => {
  try {
    const entries = await LedgerEntry.find().sort({ date: -1, createdAt: -1 }).limit(200)
    const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

    const products = await Product.find()
    const unitsOnHand = products.reduce((s, p) => s + p.stock, 0)
    const stockValueCost = products.reduce((s, p) => s + p.stock * p.buyPrice, 0)
    const stockValueRetail = products.reduce((s, p) => s + p.stock * p.sellPrice, 0)

    res.json({
      income,
      expenses,
      profit: income - expenses,
      unitsOnHand,
      stockValueCost,
      stockValueRetail,
      entries: entries.map((e) => ({ ...e.toObject(), id: String(e._id) })),
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/accounting/entries — add an income/expense entry
router.post('/entries', async (req, res, next) => {
  try {
    const { type, category, note, amount, date } = req.body
    if (!['income', 'expense'].includes(type))
      return res.status(400).json({ message: "type must be 'income' or 'expense'" })
    if (!(Number(amount) >= 0)) return res.status(400).json({ message: 'amount is required' })
    const entry = await LedgerEntry.create({
      type,
      category: category || '',
      note: note || '',
      amount: Number(amount),
      date: date || new Date().toISOString().slice(0, 10),
    })
    res.status(201).json({ ...entry.toObject(), id: String(entry._id) })
  } catch (e) {
    next(e)
  }
})

// DELETE /api/accounting/entries/:id
router.delete('/entries/:id', async (req, res, next) => {
  try {
    const r = await LedgerEntry.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ message: 'Entry not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
