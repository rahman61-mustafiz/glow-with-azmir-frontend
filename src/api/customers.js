// ============================================================
// Customers API — STUBS / PLACEHOLDERS
// ------------------------------------------------------------
// Phone type-ahead + lookup for the Sales-entry tab, mirroring the
// Noor tablet flow (suggest after 4 digits, full lookup at 11).
//
// Proposed real endpoints:
//   GET /api/customers/suggest?q=017      -> [{ name, phone }]
//   GET /api/customers/:phone            -> { found, name, phone, lastItems }
//
// TODO(backend): replace the mocked bodies with real fetch() calls.
// ============================================================

const KNOWN = [
  { name: 'Ayesha Rahman', phone: '01711001122', lastItems: ['Rose Glow Serum'] },
  { name: 'Nusrat Jahan', phone: '01712233445', lastItems: ['Velvet Matte Lipstick', 'Pearl Face Mask'] },
  { name: 'Farhana Akter', phone: '01819988776', lastItems: ['Silk Hair Oil'] },
  { name: 'Sadia Islam', phone: '01515566778', lastItems: ['Golden Hour Highlighter'] },
]

export async function suggestCustomers(digits) {
  // TODO(backend): GET /api/customers/suggest?q=<digits>
  await new Promise((r) => setTimeout(r, 120))
  const q = digits.replace(/\D/g, '')
  if (q.length < 4) return []
  return KNOWN.filter((c) => c.phone.includes(q)).slice(0, 8)
}

export async function lookupCustomer(phone) {
  // TODO(backend): GET /api/customers/<phone>
  await new Promise((r) => setTimeout(r, 150))
  const q = phone.replace(/\D/g, '')
  const found = KNOWN.find((c) => c.phone.replace(/\D/g, '') === q)
  return found
    ? { found: true, name: found.name, phone, lastItems: found.lastItems }
    : { found: false, name: '', phone, lastItems: [] }
}
