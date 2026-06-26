const mongoose = require('mongoose')

// Singleton document — store-wide settings.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'singleton', unique: true },
    storeName: { type: String, default: 'Glow with Azmir' },
    phone: { type: String, default: '' },
    currency: { type: String, default: 'BDT (৳)' },
    lowStockThreshold: { type: Number, default: 5 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Settings', settingsSchema)
