// Sales API — Today's sales feed + recording new sales.
import { api } from './client.js'

export const getTodaySales = () => api.get('/sales/today')

export const recordSale = ({ customerName, customerPhone, items }) =>
  api.post('/sales', { customerName, customerPhone, items })
