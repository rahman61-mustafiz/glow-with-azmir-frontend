const path = require('path')
const fs = require('fs')
// firebase-admin v12+ modular sub-path API
const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore')

// Resolve the service-account credentials. Two ways:
//   1. FIREBASE_SERVICE_ACCOUNT_JSON env var holding the full JSON (best for
//      hosts like Railway/Render — no file on disk).
//   2. A key file (gitignored). Defaults to ./serviceAccountKey.json; override
//      the path with FIREBASE_SERVICE_ACCOUNT.
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON.')
    }
  }
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT)
    : path.resolve(__dirname, '../../serviceAccountKey.json')
  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Firebase service account key not found at ${keyPath}.\n` +
        'Download it from Firebase Console → Project settings → Service accounts → ' +
        'Generate new private key, and save it as serviceAccountKey.json in the backend root,\n' +
        'or set FIREBASE_SERVICE_ACCOUNT_JSON to the JSON contents (for hosted deploys).'
    )
  }
  return require(keyPath)
}

// Initialize once (guards against re-init during dev reloads).
if (!getApps().length) {
  initializeApp({ credential: cert(loadServiceAccount()) })
}

const db = getFirestore()
// Lets us pass objects with `undefined` fields (e.g. optional productId) without errors.
db.settings({ ignoreUndefinedProperties: true })

module.exports = {
  db,
  FieldValue, // for increment(), serverTimestamp(), etc.
  Timestamp, // for createdAt range queries
}
