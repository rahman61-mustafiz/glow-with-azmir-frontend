const path = require('path')
const fs = require('fs')
const multer = require('multer')

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]+/gi, '-')
      .slice(0, 40)
    cb(null, `${Date.now()}-${base}${ext}`)
  },
})

// Build the public URL for a stored file.
function fileUrl(req, filename) {
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`
  return `${base.replace(/\/$/, '')}/uploads/${filename}`
}

// .mp4 only — for the Advertise video.
const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === 'video/mp4' || file.originalname.toLowerCase().endsWith('.mp4')
    cb(ok ? null : new Error('Only .mp4 video files are allowed'), ok)
  },
})

// images — for the Gallery.
const uploadImage = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    const ok = /^image\//.test(file.mimetype)
    cb(ok ? null : new Error('Only image files are allowed'), ok)
  },
})

module.exports = { UPLOAD_DIR, fileUrl, uploadVideo, uploadImage }
