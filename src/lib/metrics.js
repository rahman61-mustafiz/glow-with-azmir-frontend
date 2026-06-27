// Sales metrics computed from WooCommerce orders + a product buying-price map.
// grossProfit = revenue − COGS, where COGS = Σ (qty × _buying_price).

// buyMap: { [productId:string]: buyPrice:number }
function buyPriceMap(products) {
  const m = {}
  for (const p of products) m[String(p.id)] = Number(p.buyPrice) || 0
  return m
}

function salesMetrics(orders, buyMap) {
  let revenue = 0
  let unitsSold = 0
  let cogs = 0
  for (const o of orders || []) {
    revenue += Number(o.total) || 0
    for (const li of o.line_items || []) {
      const qty = Number(li.quantity) || 0
      unitsSold += qty
      cogs += qty * (buyMap[String(li.product_id)] || 0)
    }
  }
  return { revenue, unitsSold, cogs, grossProfit: revenue - cogs }
}

module.exports = { buyPriceMap, salesMetrics }
