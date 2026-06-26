// Sales = WooCommerce orders.
// A tablet "Confirm sale" creates a Woo order (Woo handles stock + revenue).
// Today's-sales reads back today's orders. Also mirrors the customer into
// Firestore so the Sales-entry phone type-ahead keeps working.

const { wooRequest } = require('../config/woo')
const { db, FieldValue } = require('../config/firebase')

const PAID = ['processing', 'completed', 'on-hold']

function startOfTodayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function fmtTime(iso) {
  const d = new Date(iso)
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? 'AM' : 'PM'
  h = h % 12 === 0 ? 12 : h % 12
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`
}

function feedShape(o) {
  const items = o.line_items || []
  const qty = items.reduce((n, i) => n + (i.quantity || 0), 0)
  const first = items[0] ? items[0].name : '—'
  const extra = items.length - 1
  return {
    id: String(o.id),
    product: extra > 0 ? `${first} +${extra} more` : first,
    qty,
    amount: Number(o.total) || 0,
    time: fmtTime(o.date_created),
  }
}

async function listToday() {
  const orders = await wooRequest('/orders', { query: { after: startOfTodayISO(), per_page: 100, orderby: 'date', order: 'desc' } })
  return orders.filter((o) => PAID.includes(o.status))
}

async function listRecent(limit = 100) {
  const orders = await wooRequest('/orders', { query: { per_page: limit, orderby: 'date', order: 'desc' } })
  return orders.filter((o) => PAID.includes(o.status))
}

// Sum of paid orders in the most recent page — used as "sales income" for Accounting.
async function recentRevenue(limit = 100) {
  const orders = await listRecent(limit)
  return orders.reduce((s, o) => s + (Number(o.total) || 0), 0)
}

async function create({ customerName, customerPhone, items }) {
  const name = (customerName || '').trim()
  const phone = (customerPhone || '').trim()
  const line_items = (items || [])
    .filter((i) => i.productId)
    .map((i) => ({ product_id: Number(i.productId), quantity: Number(i.qty) || 1 }))

  const order = await wooRequest('/orders', {
    method: 'POST',
    body: {
      status: 'completed', // POS sale — paid; Woo reduces stock for managed products
      billing: { first_name: name, phone },
      line_items,
      meta_data: [{ key: '_glow_source', value: 'tablet' }],
    },
  })

  // Mirror customer into Firestore for the phone type-ahead (best-effort).
  if (phone) {
    try {
      await db.collection('customers').doc(phone).set(
        {
          phone,
          name,
          lastItems: (items || []).map((i) => i.name),
          visitCount: FieldValue.increment(1),
          updatedAt: new Date(),
        },
        { merge: true }
      )
    } catch {
      /* non-fatal */
    }
  }

  return {
    id: String(order.id),
    customerName: name,
    customerPhone: phone,
    items: items || [],
    total: Number(order.total) || 0,
    createdAt: order.date_created,
  }
}

module.exports = { listToday, listRecent, recentRevenue, feedShape, create }
