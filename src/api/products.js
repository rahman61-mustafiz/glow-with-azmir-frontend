import { api } from './client.js'

// Admin product list (includes buyPrice + derived status).
export const getProducts = () => api.get('/products')

export const createProduct = (p) => api.post('/products', p)
export const updateProduct = (id, p) => api.put(`/products/${id}`, p)
export const deleteProduct = (id) => api.del(`/products/${id}`)
