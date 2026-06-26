// Shared product catalog (STUB data).
// buyPrice  = admin-only buying/cost price  (NEVER sent to public site)
// sellPrice = selling price                 (the ONLY price uploaded publicly)
// stock     = units on hand
//
// TODO(backend): replace with data from the catalog API.

export const PRODUCTS = [
  { id: 1, name: 'Rose Glow Serum',        sku: 'GWA-SER-01', buyPrice: 900,  sellPrice: 1450, stock: 32, status: 'active' },
  { id: 2, name: 'Velvet Matte Lipstick',  sku: 'GWA-LIP-04', buyPrice: 380,  sellPrice: 690,  stock: 5,  status: 'low' },
  { id: 3, name: 'Golden Hour Highlighter',sku: 'GWA-HL-02',  buyPrice: 560,  sellPrice: 980,  stock: 3,  status: 'low' },
  { id: 4, name: 'Silk Hair Oil',          sku: 'GWA-HR-07',  buyPrice: 720,  sellPrice: 1200, stock: 41, status: 'active' },
  { id: 5, name: 'Pearl Face Mask',        sku: 'GWA-MSK-03', buyPrice: 300,  sellPrice: 540,  stock: 60, status: 'active' },
]

// Currency formatter — BDT
export const fmtBDT = (n) => '৳ ' + Number(n).toLocaleString('en-BD')
