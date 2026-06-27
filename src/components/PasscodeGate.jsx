import { useState } from 'react'
import { verifyPasscode } from '../api/admin.js'
import './passcode.css'

// Gates the admin area behind a 4-digit passcode.
// State is in-memory ONLY — no cookie / session / localStorage — so every fresh
// visit and every page refresh re-prompts. Nothing renders (and no admin data
// loads) until the backend confirms the code.
export default function PasscodeGate({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (unlocked) return children

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setErr('')
    try {
      await verifyPasscode(code)
      setUnlocked(true) // in-memory only; refresh will lock again
    } catch (e) {
      setErr(e && e.message ? e.message : 'Incorrect passcode')
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <div className="gate-mark">✦</div>
        <h1 className="gate-title">Glow with Azmir</h1>
        <p className="gate-sub">Admin — enter passcode</p>
        <input
          className="gate-input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={4}
          value={code}
          onChange={(e) => {
            setErr('')
            setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
          }}
          placeholder="••••"
          aria-label="4-digit passcode"
        />
        <button className="btn btn-primary gate-btn" type="submit" disabled={busy || code.length !== 4}>
          {busy ? 'Checking…' : 'Unlock'}
        </button>
        <div className="gate-err">{err}</div>
      </form>
    </div>
  )
}
