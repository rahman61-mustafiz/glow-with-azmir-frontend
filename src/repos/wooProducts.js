// Products, sourced from WooCommerce (the source of truth).
// Maps a Woo product -> the Glow shape the frontend already expects:
//   { id, name, sku, category, buyPrice, sellPrice, stock, status }
//
// buyPrice (admin-only cost) has no native Woo field, so it's stored in product
// meta under `_glow_buy_price`. Reads default it to 0 when absent.

const { wooRequest } = require('../config/woo')

const GLOW_BUY_META = '_glow_buy_price'

function mapProduct(w) {
  const meta = Array.isArray(w.meta_data) ? w.meta_data : []
  const buy = meta.find((m) => m.key === GLOW_BUY_META)
  return {
    id: String(w.id),
    name: w.name || '',
    sku: w.sku || '',
    category: (w.categories && w.categories[0] && w.categories[0].name) || 'Uncategorized',
    buyPrice: buy ? Number(buy.value) || 0 : 0,
    sellPrice: Number(w.regular_price || w.price || 0) || 0,
    stock: w.stock_quantity != null ? Number(w.stock_quantity) : 0,
  }
}

async function list() {
  const items = await wooRequest('/products', { query: { per_page: 100, status: 'any', orderby: 'date', order: 'asc' } })
  return items.map(mapProduct)
}

async function get(id) {
  try {
    return mapProduct(await wooRequest('/products/' + id))
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

function withStatus(p, threshold) {
  return { ...p, status: p.stock <= threshold ? 'low' : 'active' }
}

module.exports = { list, get, withStatus, mapProduct, GLOW_BUY_META }
