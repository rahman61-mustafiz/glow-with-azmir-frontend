require('dotenv').config()

// Use the shop's timezone so "today's sales" matches the local day (override via TZ env).
process.env.TZ = process.env.TZ || 'Asia/Dhaka'

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const requireApiKey = require('./middleware/apiKey')
const { UPLOAD_DIR } = require('./middleware/upload')

// Initialize Firebase Admin on boot (fails fast if the service-account key is missing).
require('./config/firebase')

const app = express()
app.set('trust proxy', 1)

// ── Security & parsing ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images/video to load cross-origin
  })
)
const origins = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim())
app.use(cors({ origin: origins.includes('*') ? '*' : origins }))
app.use(express.json({ limit: '1mb' }))

app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
)

// Serve uploaded files (advertise .mp4, gallery images) — still on local disk
app.use('/uploads', express.static(UPLOAD_DIR))

// Optional light protection on writes (no-op unless API_KEY is set)
app.use('/api', requireApiKey)

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/products', require('./routes/products'))
app.use('/api/sales', require('./routes/sales'))
app.use('/api/customers', require('./routes/customers'))
app.use('/api/accounting', require('./routes/accounting'))
app.use('/api/gallery', require('./routes/gallery'))
app.use('/api/advertise', require('./routes/advertise'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/admin', require('./routes/admin'))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Manual trigger for the Telegram daily summary (handy for testing the setup).
app.get('/api/telegram/test', async (_req, res) => {
  try {
    const { sendDailySummary } = require('./jobs/telegramSummary')
    res.json(await sendDailySummary())
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// ── 404 + error handler ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found` }))
app.use((err, _req, res, _next) => {
  const status = err.status || (err.message && /allowed|required|must/.test(err.message) ? 400 : 500)
  if (status >= 500) console.error('Unhandled error:', err)
  res.status(status).json({ message: err.message || 'Internal server error' })
})

// ── Scheduled Telegram daily summary ────────────────────────────────────────
const cron = require('node-cron')
const telegram = require('./jobs/telegramSummary')
const SUMMARY_CRON = process.env.TELEGRAM_SUMMARY_CRON || '0 21 * * *' // 9:00 PM daily (TZ above)
if (telegram.configured()) {
  cron.schedule(SUMMARY_CRON, () => {
    telegram
      .sendDailySummary()
      .then(() => console.log('[telegram] daily summary sent'))
      .catch((e) => console.error('[telegram] summary error:', e.message))
  })
  console.log('[telegram] daily summary scheduled:', SUMMARY_CRON)
} else {
  console.log('[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set — daily summary disabled')
}

// ── Auto-publish in-stock products (rule: stock >= 1 -> publicly visible) ─────
const wooProducts = require('./repos/wooProducts')
const { configured: wooConfigured } = require('./config/woo')
const PUBLISH_SWEEP_CRON = process.env.PUBLISH_SWEEP_CRON || '*/10 * * * *' // every 10 min
if (wooConfigured()) {
  cron.schedule(PUBLISH_SWEEP_CRON, () => {
    wooProducts
      .publishInStockDrafts()
      .then((ids) => { if (ids.length) console.log('[publish-sweep] published in-stock drafts:', ids.join(',')) })
      .catch((e) => console.error('[publish-sweep] error:', e.message))
  })
  console.log('[publish-sweep] scheduled:', PUBLISH_SWEEP_CRON)
}

// ── Start ───────────────────────────────────────────────────────────────────
// Firestore connects lazily over HTTPS — no explicit DB connection step needed.
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`\nGlow with Azmir API (Firestore) on http://localhost:${PORT}`)
  console.log(`Health: http://localhost:${PORT}/health\n`)
})
