const mongoose = require('mongoose')

// Singleton document — the Advertise section shown on the public website home page.
const advertiseSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'singleton', unique: true },
    videoUrl: { type: String, default: '' }, // .mp4 URL
    description: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Advertise', advertiseSchema)
