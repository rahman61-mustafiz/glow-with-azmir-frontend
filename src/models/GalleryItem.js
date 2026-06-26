const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    imageUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('GalleryItem', gallerySchema)
