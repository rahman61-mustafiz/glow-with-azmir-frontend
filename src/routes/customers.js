const router = require('express').Router()
const customers = require('../repos/customers')

// GET /api/customers/suggest?q=017  — type-ahead (min 4 digits)
// NOTE: must be declared before '/:phone' so it isn't captured as a phone.
router.get('/suggest', async (req, res, next) => {
  try {
    res.json(await customers.suggest(req.query.q || ''))
  } catch (e) {
    next(e)
  }
})

// GET /api/customers/:phone  — full lookup
router.get('/:phone', async (req, res, next) => {
  try {
    res.json(await customers.lookup(req.params.phone))
  } catch (e) {
    next(e)
  }
})

module.exports = router
