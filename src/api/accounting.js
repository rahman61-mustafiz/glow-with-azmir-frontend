// Accounting API — bookkeeping summary + ledger entries.
import { api } from './client.js'

export const getAccountingSummary = () => api.get('/accounting/summary')
export const addLedgerEntry = (entry) => api.post('/accounting/entries', entry)
export const deleteLedgerEntry = (id) => api.del(`/accounting/entries/${id}`)
