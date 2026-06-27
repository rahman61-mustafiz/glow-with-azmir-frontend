const router = require('express').Router()

// POST /api/admin/verify  { passcode: "1234" }
// Validates the 4-digit admin passcode against the ADMIN_PASSCODE env var.
// The code lives only on the server — never in the frontend bundle.
router.post('/verify', (req, res) => {
  const expected = process.env.ADMIN_PASSCODE || ''
  if (!expected) {
    return res.status(500).json({ ok: false, message: 'ADMIN_PASSCODE is not configured on the server.' })
  }
  const code = String((req.body && req.body.passcode) || '')
  if (code.length > 0 && code === expected) {
    return res.json({ ok: true })
  }
  return res.status(401).json({ ok: false, message: 'Incorrect passcode' })
})

module.exports = router
