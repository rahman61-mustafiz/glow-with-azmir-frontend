// Advertise API — controls the Advertise section on the public website home page.
import { api } from './client.js'

export async function getAdvertise() {
  return api.get('/advertise')
}

// Save video (.mp4 File, optional) and/or description via multipart PUT.
export async function saveAdvertise({ videoFile, description }) {
  const form = new FormData()
  if (videoFile) form.append('video', videoFile)
  form.append('description', description ?? '')
  return api.putForm('/advertise', form)
}
