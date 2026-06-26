const { db } = require('../config/firebase')
const { serialize, now } = require('./util')

const col = db.collection('gallery')

async function list() {
  const snap = await col.orderBy('createdAt', 'desc').get()
  return snap.docs.map(serialize)
}

async function create({ title, category, imageUrl, active }) {
  const ts = now()
  const ref = await col.add({
    title: title || '',
    category: category || '',
    imageUrl: imageUrl || '',
    active: active === undefined ? true : !!active,
    createdAt: ts,
    updatedAt: ts,
  })
  return serialize(await ref.get())
}

async function update(id, data) {
  const ref = col.doc(id)
  if (!(await ref.get()).exists) return null
  await ref.update({ ...data, updatedAt: now() })
  return serialize(await ref.get())
}

async function remove(id) {
  const ref = col.doc(id)
  if (!(await ref.get()).exists) return false
  await ref.delete()
  return true
}

module.exports = { list, create, update, remove }
