const mongoose = require('mongoose')

// Connect to MongoDB.
//
// - If MONGODB_URI is set, use it (production / your Atlas or Railway DB).
// - If it's NOT set, spin up an in-memory MongoDB so the API "just works"
//   locally with zero setup. (Data is wiped on restart — dev only.)
async function connectDB() {
  let uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn(
      '\n[dev] MONGODB_URI not set — starting an in-memory MongoDB (data is NOT persisted).\n' +
        '      Set MONGODB_URI in .env to use a real database.\n'
    )
    const { MongoMemoryServer } = require('mongodb-memory-server')
    const mem = await MongoMemoryServer.create()
    uri = mem.getUri('glow_with_azmir')
    // keep a handle so it isn't garbage-collected
    global.__MEM_MONGO__ = mem
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  console.log('MongoDB connected:', mongoose.connection.host)
}

module.exports = { connectDB }
