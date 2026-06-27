// Products, sourced from WooCommerce (the source of truth).
// Maps a Woo product <-> the Glow shape the frontend expects:
//   { id, name, sku, category, buyPrice, sellPrice, stock, status, image, description }
//
// buyPrice (admin-only cost) has no native Woo field, so it's stored in a PRIVATE
// product meta field `_buying_price` (underscore prefix = hidden from the REST
// public view / storefront).

const { wooRequest } = require('../config/woo')

const BUY_META = '_buying_price'

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mapProduct(w) {
  const meta = Array.isArray(w.meta_data) ? w.meta_data : []
  const buy = meta.find((m) => m.key === BUY_META)
  const image = Array.isArray(w.images) && w.images[0] ? w.images[0].src : ''
  return {
    id: String(w.id),
    name: w.name || '',
    sku: w.sku || '',
    category: (w.categories && w.categories[0] && w.categories[0].name) || 'Uncategorized',
    buyPrice: buy ? Number(buy.value) || 0 : 0,
    sellPrice: Number(w.regular_price || w.price || 0) || 0,
    stock: w.stock_quantity != null ? Number(w.stock_quantity) : 0,
    manageStock: !!w.manage_stock,
    stockStatus: w.stock_status || 'instock',
    image,
    description: stripHtml(w.short_description).slice(0, 160),
  }
}

function withStatus(p, threshold) {
  // When Woo tracks quantity, use the threshold. Otherwise fall back to Woo's
  // in-stock flag (so unmanaged-but-in-stock products aren't shown as "low").
  let status
  if (p.manageStock) status = p.stock <= threshold ? 'low' : 'active'
  else status = p.stockStatus === 'outofstock' ? 'low' : 'active'
  return { ...p, status }
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

// Find a category id by name, creating the category if it doesn't exist.
async function resolveCategoryId(name) {
  if (!name) return null
  const matches = await wooRequest('/products/categories', { query: { search: name, per_page: 50 } })
  const exact = matches.find((c) => (c.name || '').toLowerCase() === name.toLowerCase())
  if (exact) return exact.id
  const created = await wooRequest('/products/categories', { method: 'POST', body: { name } })
  return created.id
}

// Build a Woo product payload from the Glow shape.
async function toWooBody(data) {
  const body = { meta_data: [] }
  if (data.name !== undefined) body.name = data.name
  if (data.sku !== undefined) body.sku = data.sku || ''
  if (data.sellPrice !== undefined) body.regular_price = String(Number(data.sellPrice) || 0)
  if (data.buyPrice !== undefined) body.meta_data.push({ key: BUY_META, value: String(Number(data.buyPrice) || 0) })
  if (data.stock !== undefined) {
    body.manage_stock = true
    body.stock_quantity = Number(data.stock) || 0
  }
  if (data.category) {
    const catId = await resolveCategoryId(data.category)
    if (catId) body.categories = [{ id: catId }]
  }
  if (!body.meta_data.length) delete body.meta_data
  return body
}

async function create(data) {
  const body = await toWooBody(data)
  body.type = body.type || 'simple'
  if (body.status === undefined) body.status = 'publish'
  return mapProduct(await wooRequest('/products', { method: 'POST', body }))
}

async function update(id, data) {
  try {
    const body = await toWooBody(data)
    return mapProduct(await wooRequest('/products/' + id, { method: 'PUT', body }))
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

async function remove(id) {
  try {
    await wooRequest('/products/' + id, { method: 'DELETE', query: { force: true } })
    return true
  } catch (e) {
    if (e.status === 404) return false
    throw e
  }
}

module.exports = { list, get, create, update, remove, withStatus, mapProduct, BUY_META }
