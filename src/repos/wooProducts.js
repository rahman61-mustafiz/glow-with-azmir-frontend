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
    published: w.status === 'publish',
    visibility: w.catalog_visibility || 'visible',
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
    const qty = Number(data.stock) || 0
    body.manage_stock = true
    body.stock_quantity = qty
    body.stock_status = qty > 0 ? 'instock' : 'outofstock' // not hidden as out-of-stock
  }
  if (data.shortDescription !== undefined) body.short_description = data.shortDescription
  if (data.description !== undefined) body.description = data.description
  // images: array of URLs; Woo side-loads each into the media library, first = featured.
  if (Array.isArray(data.images) && data.images.length) {
    body.images = data.images.filter(Boolean).map((src) => ({ src }))
  }
  if (data.category) {
    const catId = await resolveCategoryId(data.category)
    if (catId) body.categories = [{ id: catId }]
  }
  // Optional passthroughs (used to flip an existing product's visibility/status).
  const status = data.status
  if (status !== undefined) body.status = status
  const vis = data.catalog_visibility ?? data.catalogVisibility
  if (vis !== undefined) body.catalog_visibility = vis
  const ss = data.stock_status ?? data.stockStatus
  if (ss !== undefined) body.stock_status = ss
  if (!body.meta_data.length) delete body.meta_data
  return body
}

async function create(data) {
  // Always default a category (some shop pages filter by category).
  const d = { ...data, category: data.category || process.env.WOO_DEFAULT_CATEGORY || 'Uncategorized' }
  const full = await toWooBody(d)
  // Images are attached in a 2nd step so a side-load failure can NEVER leave the
  // product as a hidden draft — the product is published first, image is best-effort.
  const images = full.images
  delete full.images

  full.type = full.type || 'simple'
  full.status = 'publish'
  full.catalog_visibility = 'visible'

  const created = await wooRequest('/products', { method: 'POST', body: full })

  if (Array.isArray(images) && images.length) {
    try {
      const updated = await wooRequest('/products/' + created.id, { method: 'PUT', body: { images } })
      return mapProduct(updated)
    } catch {
      return mapProduct(created) // published without image, rather than failing/drafting
    }
  }
  return mapProduct(created)
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
