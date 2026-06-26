const router = require('express').Router()
const advertise = require('../repos/advertise')
const { uploadVideo, fileUrl } = require('../middleware/upload')

// GET /api/advertise  — read current advertise content (public + admin)
router.get('/', async (_req, res, next) => {
  try {
    res.json(await advertise.get())
  } catch (e) {
    next(e)
  }
})

// PUT /api/advertise  — update video (.mp4) and/or description
// multipart/form-data: field "video" (optional file), field "description" (text)
router.put('/', uploadVideo.single('video'), async (req, res, next) => {
  try {
    const patch = {}
    if (req.file) patch.videoUrl = fileUrl(req, req.file.filename)
    if (typeof req.body.description === 'string') patch.description = req.body.description
    res.json(await advertise.update(patch))
  } catch (e) {
    next(e)
  }
})

module.exports = router
