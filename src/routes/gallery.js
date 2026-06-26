const router = require('express').Router()
const GalleryItem = require('../models/GalleryItem')
const { uploadImage, fileUrl } = require('../middleware/upload')

const shape = (g) => ({ ...g.toObject(), id: String(g._id) })

// GET /api/gallery
router.get('/', async (_req, res, next) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 })
    res.json(items.map(shape))
  } catch (e) {
    next(e)
  }
})

// POST /api/gallery  (multipart: image file + title/category fields)
router.post('/', uploadImage.single('image'), async (req, res, next) => {
  try {
    const { title, category, active } = req.body
    const imageUrl = req.file ? fileUrl(req, req.file.filename) : req.body.imageUrl || ''
    const item = await GalleryItem.create({
      title: title || '',
      category: category || '',
      imageUrl,
      active: active === undefined ? true : active === 'true' || active === true,
    })
    res.status(201).json(shape(item))
  } catch (e) {
    next(e)
  }
})

// PUT /api/gallery/:id  (toggle active / edit title/category)
router.put('/:id', async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ message: 'Gallery item not found' })
    res.json(shape(item))
  } catch (e) {
    next(e)
  }
})

// DELETE /api/gallery/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await GalleryItem.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ message: 'Gallery item not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
