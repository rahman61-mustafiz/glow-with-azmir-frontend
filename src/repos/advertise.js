const { db } = require('../config/firebase')
const { now, toISO } = require('./util')

// Singleton document.
const ref = db.collection('advertise').doc('singleton')

const shape = (data, fallbackTs) => ({
  videoUrl: data.videoUrl || '',
  description: data.description || '',
  updatedAt: toISO(data.updatedAt) || fallbackTs || null,
})

async function get() {
  const d = await ref.get()
  if (!d.exists) {
    const ts = now()
    await ref.set({ videoUrl: '', description: '', createdAt: ts, updatedAt: ts })
    return shape({ videoUrl: '', description: '' }, ts.toDate().toISOString())
  }
  return shape(d.data())
}

async function update({ videoUrl, description }) {
  const patch = { updatedAt: now() }
  if (videoUrl !== undefined) patch.videoUrl = videoUrl
  if (description !== undefined) patch.description = description
  await ref.set(patch, { merge: true })
  return get()
}

module.exports = { get, update }
