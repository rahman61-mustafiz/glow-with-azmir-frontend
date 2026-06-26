// Gallery API — list / add (image upload) / delete.
import { api } from './client.js'

export const getGallery = () => api.get('/gallery')

export function addGalleryItem({ title, category, imageFile }) {
  const form = new FormData()
  form.append('title', title ?? '')
  form.append('category', category ?? '')
  if (imageFile) form.append('image', imageFile)
  return api.postForm('/gallery', form)
}

export const deleteGalleryItem = (id) => api.del(`/gallery/${id}`)
