// Telegram daily summary: revenue, units sold, gross profit, stock remaining.
// Secrets in env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.

const wooProducts = require('../repos/wooProducts')
const wooSales = require('../repos/wooSales')
const { buyPriceMap, salesMetrics } = require('../lib/metrics')

function configured() {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

const tk = (n) => '৳ ' + Math.round(Number(n) || 0).toLocaleString('en-BD')

async function buildSummary() {
  const products = await wooProducts.list()
  const orders = await wooSales.listToday()
  const m = salesMetrics(orders, buyPriceMap(products))
  const stockRemaining = products.reduce((s, p) => s + (Number(p.stock) || 0), 0)
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return {
    date,
    orders: orders.length,
    revenue: m.revenue,
    unitsSold: m.unitsSold,
    grossProfit: m.grossProfit,
    stockRemaining,
  }
}

function formatMessage(s) {
  return [
    '*Glow with Azmir — Daily Summary*',
    '_' + s.date + '_',
    '',
    'Orders: ' + s.orders,
    'Revenue: ' + tk(s.revenue),
    'Units sold: ' + s.unitsSold,
    'Gross profit: ' + tk(s.grossProfit),
    'Stock remaining: ' + s.stockRemaining + ' units',
  ].join('\n')
}

async function sendDailySummary() {
  if (!configured()) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set — skipping')
    return { ok: false, reason: 'not-configured' }
  }
  const summary = await buildSummary()
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: formatMessage(summary), parse_mode: 'Markdown' }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.ok === false) {
    throw new Error('Telegram send failed: ' + (body.description || res.status))
  }
  return { ok: true, summary }
}

module.exports = { buildSummary, sendDailySummary, configured }
