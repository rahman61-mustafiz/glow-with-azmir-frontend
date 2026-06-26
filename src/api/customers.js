// Customers API — phone type-ahead + lookup for the Sales-entry tab.
import { api } from './client.js'

export const suggestCustomers = (digits) =>
  api.get(`/customers/suggest?q=${encodeURIComponent(digits)}`)

export const lookupCustomer = (phone) => api.get(`/customers/${encodeURIComponent(phone)}`)
