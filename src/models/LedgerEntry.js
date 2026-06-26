const mongoose = require('mongoose')

const ledgerSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, default: '' }, // YYYY-MM-DD
    // Set when an entry was auto-created from a sale (so we don't double count).
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model('LedgerEntry', ledgerSchema)
