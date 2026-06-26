const router = require('express').Router()
const settings = require('../repos/settings')

// GET /api/settings
router.get('/', async (_req, res, next) => {
  try {
    res.json(await settings.get())
  } catch (e) {
    next(e)
  }
})

// PUT /api/settings
router.put('/', async (req, res, next) => {
  try {
    res.json(await settings.update(req.body))
  } catch (e) {
    next(e)
  }
})

module.exports = router
