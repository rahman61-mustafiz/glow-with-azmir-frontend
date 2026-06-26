// Force-reseed Firestore with starter data.  Usage:  npm run seed
require('dotenv').config()
require('./config/firebase') // initialize Firebase Admin
const { seed } = require('./lib/starterData')

async function run() {
  console.log('Reseeding Firestore (force)…')
  await seed({ force: true })
  console.log('Done — products, gallery, ledger, advertise & settings seeded.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
