// OPTIONAL light protection (no login UI, per requirements).
// If API_KEY is set in the environment, write requests (POST/PUT/PATCH/DELETE)
// must include header  x-api-key: <API_KEY>. If API_KEY is empty, the API is open.
module.exports = function requireApiKey(req, res, next) {
  const configured = process.env.API_KEY
  if (!configured) return next() // open mode

  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(req.method)) return next() // reads stay open

  if (req.get('x-api-key') === configured) return next()
  return res.status(401).json({ message: 'Invalid or missing API key' })
}
