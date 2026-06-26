const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, unique: true, index: true },
    lastItems: { type: [String], default: [] },
    visitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Customer', customerSchema)
