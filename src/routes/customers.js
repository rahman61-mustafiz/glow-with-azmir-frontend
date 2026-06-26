const router = require('express').Router()
const Customer = require('../models/Customer')

// GET /api/customers/suggest?q=017  — type-ahead (min 4 digits)
router.get('/suggest', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').replace(/\D/g, '')
    if (q.length < 4) return res.json([])
    const matches = await Customer.find({ phone: { $regex: q } }).limit(8)
    res.json(matches.map((c) => ({ name: c.name, phone: c.phone, lastItems: c.lastItems })))
  } catch (e) {
    next(e)
  }
})

// GET /api/customers/:phone  — full lookup
router.get('/:phone', async (req, res, next) => {
  try {
    const phone = String(req.params.phone)
    const c = await Customer.findOne({ phone })
    if (!c) return res.json({ found: false, name: '', phone, lastItems: [] })
    res.json({ found: true, name: c.name, phone: c.phone, lastItems: c.lastItems })
  } catch (e) {
    next(e)
  }
})

module.exports = router
