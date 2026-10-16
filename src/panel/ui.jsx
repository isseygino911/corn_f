import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import Nav from '../sections/Nav.jsx'
import SignOutButton from '../auth/SignOutButton.jsx'
import { useAction } from '../auth/useAction.js'
import { Message } from '../auth/ui.jsx'
import './panel.css'

export const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`

// Whole-dollar-and-cents text → integer cents, or NaN when it is not a price.
export const toCents = (text) => (/^\d+(\.\d{1,2})?$/.test(text.trim()) ? Math.round(Number(text) * 100) : NaN)
export const fromCents = (cents) => (cents / 100).toFixed(2)

// Sidebar + content pane. `links` is [{ to, label, end? }].
export function PanelShell({ title, links }) {
  return (
    <>
      <Nav />
      <main className="panel">
        <aside className="panel-side">
          <h1>{title}</h1>
          <nav aria-label={title}>
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>{label}</NavLink>
            ))}
          </nav>
          <SignOutButton className="pill" />
        </aside>
        <section className="panel-main">
          <Outlet />
        </section>
      </main>
    </>
  )
}

export const Heading = ({ children, action }) => (
  <header className="panel-head">
    <h2>{children}</h2>
    {action}
  </header>
)

// Loads fn() on mount and whenever deps change; reload() refetches.
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    fn().then(
      (data) => live && setState({ data, error: null }),
      (error) => live && setState({ data: null, error }),
    )
    return () => {
      live = false
    }
  }, [...deps, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, loading: !state.data && !state.error, reload }
}

// Renders the loading / error states, then children(data).
export function Loaded({ load, children }) {
  if (load.error) return <Message error>{load.error.message}</Message>
  if (load.loading) return <p className="panel-empty">Loading…</p>
  return children(load.data)
}

export const Select = ({ label, children, ...input }) => (
  <label className="field">
    <span>{label}</span>
    <select {...input}>{children}</select>
  </label>
)

export const Textarea = ({ label, ...input }) => (
  <label className="field">
    <span>{label}</span>
    <textarea rows={4} {...input} />
  </label>
)

export const Check = ({ label, ...input }) => (
  <label className="check">
    <input type="checkbox" {...input} />
    <span>{label}</span>
  </label>
)

// Runs an async action from a button and shows its error inline.
export function ActionButton({ action, children, className = 'pill' }) {
  const { run, pending, error } = useAction(action)
  return (
    <>
      <button type="button" className={className} disabled={pending} onClick={run}>{children}</button>
      {error && <Message error>{error.message}</Message>}
    </>
  )
}

// Controlled-form shell: submit runs onSubmit(); errors and a saved notice show under the fields.
export function PanelForm({ submit, onSubmit, children }) {
  const { run, pending, error, result } = useAction(onSubmit)
  return (
    <form
      className="auth-form panel-form"
      onSubmit={(e) => {
        e.preventDefault()
        run()
      }}
    >
      {children}
      {error && <Message error>{error.message}</Message>}
      {result?.message && <Message>{result.message}</Message>}
      <button className="pill pill-solid" disabled={pending}>{pending ? 'One moment…' : submit}</button>
    </form>
  )
}
