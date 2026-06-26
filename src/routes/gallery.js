const router = require('express').Router()
const gallery = require('../repos/gallery')
const { uploadImage, fileUrl } = require('../middleware/upload')

// GET /api/gallery
router.get('/', async (_req, res, next) => {
  try {
    res.json(await gallery.list())
  } catch (e) {
    next(e)
  }
})

// POST /api/gallery  (multipart: image file + title/category fields)
router.post('/', uploadImage.single('image'), async (req, res, next) => {
  try {
    const { title, category, active } = req.body
    const imageUrl = req.file ? fileUrl(req, req.file.filename) : req.body.imageUrl || ''
    const item = await gallery.create({
      title,
      category,
      imageUrl,
      active: active === undefined ? true : active === 'true' || active === true,
    })
    res.status(201).json(item)
  } catch (e) {
    next(e)
  }
})

// PUT /api/gallery/:id  (toggle active / edit title/category)
router.put('/:id', async (req, res, next) => {
  try {
    const item = await gallery.update(req.params.id, req.body)
    if (!item) return res.status(404).json({ message: 'Gallery item not found' })
    res.json(item)
  } catch (e) {
    next(e)
  }
})

// DELETE /api/gallery/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await gallery.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Gallery item not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
