// Force-reseed the database with starter data.  Usage:  npm run seed
require('dotenv').config()
const mongoose = require('mongoose')
const { connectDB } = require('./config/db')
const { seed } = require('./lib/starterData')

async function run() {
  await connectDB()
  console.log('Reseeding (force)…')
  await seed({ force: true })
  console.log('Done.')
  await mongoose.connection.close()
  if (global.__MEM_MONGO__) await global.__MEM_MONGO__.stop()
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
