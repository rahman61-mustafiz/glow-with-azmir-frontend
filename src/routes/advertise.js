const router = require('express').Router()
const Advertise = require('../models/Advertise')
const { uploadVideo, fileUrl } = require('../middleware/upload')

async function getDoc() {
  let doc = await Advertise.findOne({ key: 'singleton' })
  if (!doc) doc = await Advertise.create({ key: 'singleton' })
  return doc
}

const shape = (d) => ({ videoUrl: d.videoUrl, description: d.description, updatedAt: d.updatedAt })

// GET /api/advertise  — read current advertise content (public + admin)
router.get('/', async (_req, res, next) => {
  try {
    res.json(shape(await getDoc()))
  } catch (e) {
    next(e)
  }
})

// PUT /api/advertise  — update video (.mp4) and/or description
// multipart/form-data: field "video" (optional file), field "description" (text)
router.put('/', uploadVideo.single('video'), async (req, res, next) => {
  try {
    const doc = await getDoc()
    if (req.file) doc.videoUrl = fileUrl(req, req.file.filename)
    if (typeof req.body.description === 'string') doc.description = req.body.description
    await doc.save()
    res.json(shape(doc))
  } catch (e) {
    next(e)
  }
})

module.exports = router
