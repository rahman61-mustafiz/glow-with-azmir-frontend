import { api } from './client.js'

// Validates the 4-digit passcode on the backend (ADMIN_PASSCODE). Throws on wrong code.
export const verifyPasscode = (passcode) => api.post('/admin/verify', { passcode })
