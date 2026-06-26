const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'Uncategorized' },
    // buyPrice is admin-only (never exposed on the public website).
    buyPrice: { type: Number, default: 0, min: 0 },
    // sellPrice is the public price.
    sellPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

// status is derived from stock (low when at/under threshold). Threshold comes
// from Settings; default 5. Computed in the route layer and sent to clients.
module.exports = mongoose.model('Product', productSchema)
