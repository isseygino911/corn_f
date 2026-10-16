import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { post } from './api.js'
import { useAction } from './useAction.js'
import { AuthPage, Message } from './ui.jsx'

export default function VerifyEmail() {
  const token = useSearchParams()[0].get('token')
  const { run, error, result } = useAction(() => post('/verify-email', { token }))
  // The token is single-use, so StrictMode's second effect pass must not send it again.
  const started = useRef(false)
  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    run()
  }, [token])

  return (
    <AuthPage title="Verify your email">
      {!token && <Message error>This verification link is incomplete.</Message>}
      {token && !error && !result && <Message>Verifying…</Message>}
      {error && <Message error>{error.message}</Message>}
      {result && <Message>{result.message}</Message>}
      <p className="auth-links">
        <Link to="/login">Sign in</Link>
      </p>
    </AuthPage>
  )
}
