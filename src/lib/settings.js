const Settings = require('../models/Settings')

// Get the singleton settings doc, creating it with defaults if missing.
async function getSettings() {
  let s = await Settings.findOne({ key: 'singleton' })
  if (!s) s = await Settings.create({ key: 'singleton' })
  return s
}

// Attach derived status to a product plain object.
function withStatus(product, threshold) {
  const p = product.toObject ? product.toObject() : product
  return { ...p, id: String(p._id), status: p.stock <= threshold ? 'low' : 'active' }
}

module.exports = { getSettings, withStatus }
