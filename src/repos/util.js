const { Timestamp } = require('../config/firebase')

// Firestore Timestamp / Date / string -> ISO string (matches what the frontend
// used to receive from Mongoose). Null/undefined pass through.
function toISO(v) {
  if (v == null) return null
  if (typeof v.toDate === 'function') return v.toDate().toISOString() // Firestore Timestamp
  if (v instanceof Date) return v.toISOString()
  return v // already a string
}

// DocumentSnapshot -> plain object with `id` and ISO timestamps.
function serialize(snap) {
  const data = snap.data() || {}
  return { id: snap.id, ...data, createdAt: toISO(data.createdAt), updatedAt: toISO(data.updatedAt) }
}

// Current time as a Firestore Timestamp (deterministic, returnable immediately).
function now() {
  return Timestamp.now()
}

module.exports = { toISO, serialize, now }
