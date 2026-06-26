const mongoose = require('mongoose')

const lineSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, // selling price at time of sale
  },
  { _id: false }
)

const saleSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true, default: '' },
    items: { type: [lineSchema], required: true },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Sale', saleSchema)
