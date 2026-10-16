import { post } from './api.js'
import { useAction } from './useAction.js'
import Nav from '../sections/Nav.jsx'
import './auth.css'

export function AuthPage({ title, lede, children }) {
  return (
    <>
      <Nav />
      <main className="auth">
        <div className="auth-card">
          <h1>{title}</h1>
          {lede && <p>{lede}</p>}
          {children}
        </div>
      </main>
    </>
  )
}

export const Message = ({ error, children }) => (
  <p className={error ? 'auth-msg error' : 'auth-msg'} role={error ? 'alert' : 'status'}>
    {children}
  </p>
)

export const Field = ({ label, ...input }) => (
  <label className="field">
    <span>{label}</span>
    <input {...input} />
  </label>
)

// Uncontrolled form: onSubmit receives the fields as an object; a `{ message }` result is shown as a notice.
export function Form({ submit, onSubmit, children }) {
  const { run, pending, error, result } = useAction(onSubmit)
  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    run(Object.fromEntries(new FormData(form))).then((done) => done && form.reset())
  }
  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {children}
      {error && <Message error>{error.message}</Message>}
      {result?.message && <Message>{result.message}</Message>}
      <button className="pill pill-solid" disabled={pending}>
        {pending ? 'One moment…' : submit}
      </button>
    </form>
  )
}

export const GoogleButton = () => (
  <a className="pill pill-wide" href="/api/auth/google">
    Continue with Google
  </a>
)

export function ResendVerification({ email }) {
  const { run, pending, error, result } = useAction(() => post('/resend-verification', { email }))
  return (
    <div className="auth-resend">
      <button type="button" className="pill" disabled={pending} onClick={run}>
        Resend verification email
      </button>
      {error && <Message error>{error.message}</Message>}
      {result && <Message>{result.message}</Message>}
    </div>
  )
}
