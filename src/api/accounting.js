// ============================================================
// Accounting API — STUBS / PLACEHOLDERS
// ------------------------------------------------------------
// Powers the "Accounting" bookkeeping section: income,
// expenses, profit, and current stock value.
//
// Stock value is derived from BUYING prices (cost of stock on
// hand) — see src/data/products.js.
//
// Proposed real endpoints:
//   GET /api/accounting/summary -> { income, expenses, entries: [...] }
//
// TODO(backend): replace the mocked body with real calls.
// ============================================================

import { PRODUCTS } from '../data/products.js'

export async function getAccountingSummary() {
  // TODO(backend): replace with
  //   const res = await fetch('/api/accounting/summary')
  //   return res.json()
  await new Promise((r) => setTimeout(r, 300))

  // Ledger entries (income + expenses). Stubbed.
  const entries = [
    { id: 'E-201', date: '2026-06-26', type: 'income',  category: 'Product sales',   note: "Today's sales", amount: 6630 },
    { id: 'E-200', date: '2026-06-25', type: 'income',  category: 'Product sales',   note: 'Daily sales',   amount: 8120 },
    { id: 'E-199', date: '2026-06-24', type: 'expense', category: 'Stock purchase',  note: 'Serum restock', amount: 18000 },
    { id: 'E-198', date: '2026-06-23', type: 'expense', category: 'Rent',            note: 'Shop rent',     amount: 12000 },
    { id: 'E-197', date: '2026-06-22', type: 'income',  category: 'Product sales',   note: 'Daily sales',   amount: 5400 },
    { id: 'E-196', date: '2026-06-21', type: 'expense', category: 'Marketing',       note: 'Ad boost',      amount: 2500 },
  ]

  const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

  // Stock metrics derived from the shared catalog.
  const unitsOnHand = PRODUCTS.reduce((s, p) => s + p.stock, 0)
  // Stock value at COST (buying price) — what the inventory is worth to the business.
  const stockValueCost = PRODUCTS.reduce((s, p) => s + p.stock * p.buyPrice, 0)
  // Stock value at retail (selling price) — potential revenue if all sold.
  const stockValueRetail = PRODUCTS.reduce((s, p) => s + p.stock * p.sellPrice, 0)

  return {
    income,
    expenses,
    profit: income - expenses,
    unitsOnHand,
    stockValueCost,
    stockValueRetail,
    entries,
  }
}
