require('dotenv').config()

const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { connectDB } = require('./config/db')
const requireApiKey = require('./middleware/apiKey')
const { UPLOAD_DIR } = require('./middleware/upload')

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

// Serve uploaded files (advertise .mp4, gallery images)
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

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── 404 + error handler ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found` }))
app.use((err, _req, res, _next) => {
  // Multer / validation errors -> 400; everything else -> 500
  const status = err.status || (err.message && /allowed|required|must/.test(err.message) ? 400 : 500)
  if (status >= 500) console.error('Unhandled error:', err)
  res.status(status).json({ message: err.message || 'Internal server error' })
})

// ── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000
connectDB()
  .then(async () => {
    // Seed starter data when the DB is empty (helps in-memory dev + fresh DBs).
    const { seed } = require('./lib/starterData')
    if (await seed()) console.log('Seeded starter data (DB was empty).')
    app.listen(PORT, () => {
      console.log(`\nGlow with Azmir API on http://localhost:${PORT}`)
      console.log(`Health: http://localhost:${PORT}/health\n`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
