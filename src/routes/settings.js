const router = require('express').Router()
const { getSettings } = require('../lib/settings')

const shape = (s) => ({
  storeName: s.storeName,
  phone: s.phone,
  currency: s.currency,
  lowStockThreshold: s.lowStockThreshold,
})

// GET /api/settings
router.get('/', async (_req, res, next) => {
  try {
    res.json(shape(await getSettings()))
  } catch (e) {
    next(e)
  }
})

// PUT /api/settings
router.put('/', async (req, res, next) => {
  try {
    const s = await getSettings()
    const { storeName, phone, currency, lowStockThreshold } = req.body
    if (storeName !== undefined) s.storeName = storeName
    if (phone !== undefined) s.phone = phone
    if (currency !== undefined) s.currency = currency
    if (lowStockThreshold !== undefined) s.lowStockThreshold = Number(lowStockThreshold)
    await s.save()
    res.json(shape(s))
  } catch (e) {
    next(e)
  }
})

module.exports = router
