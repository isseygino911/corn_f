import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLenis } from 'lenis/react'
import { Link } from 'react-router'
import NavAuth from '../auth/NavAuth.jsx'
import { BRAND, NAV, ORIGIN } from '../copy.js'

export const Cta = ({ label, href }) => (
  <Link className="cta" to={href} aria-label={label}>
    <span>{label}</span>
    <i className="cta-icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m6 3 5 5-5 5" />
      </svg>
    </i>
  </Link>
)

const DARK_SECTIONS = '#hero, #craft, #leaf, #process, .farm-statement, #footer-cta, .canvas-layer'

// Flips the nav to its dark theme while a dark section sits under the bar.
function useNavTheme() {
  const ref = useRef(null)
  useEffect(() => {
    const targets = document.querySelectorAll(DARK_SECTIONS)
    if (!targets.length) {
      ref.current.dataset.theme = 'light'
      return
    }
    const under = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? under.add(e.target) : under.delete(e.target)))
        ref.current.dataset.theme = under.size ? 'dark' : 'light'
      },
      { rootMargin: `0px 0px -${100 - (ref.current.offsetHeight / innerHeight) * 100}% 0px` },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

const DESKTOP = window.matchMedia('(min-width: 810px)')
const FOCUSABLE = 'a[href], button'

// Mobile menu: full-screen overlay with scroll lock, focus trap, Escape and focus return.
function useMobileMenu(buttonRef, menuRef) {
  const [open, setOpen] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    if (lenis) lenis.stop()
    else html.style.overflow = 'hidden'
    const button = buttonRef.current
    menuRef.current.querySelector(FOCUSABLE).focus()

    const close = () => setOpen(false)
    const onKey = (e) => {
      if (e.key === 'Escape') return close()
      if (e.key !== 'Tab') return
      const stops = [button, ...menuRef.current.querySelectorAll(FOCUSABLE)]
      const first = stops[0]
      const last = stops.at(-1)
      if (!stops.includes(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    DESKTOP.addEventListener('change', close)
    return () => {
      document.removeEventListener('keydown', onKey)
      DESKTOP.removeEventListener('change', close)
      if (lenis) lenis.start()
      else html.style.overflow = ''
      button.focus({ preventScroll: true })
    }
  }, [open, lenis, buttonRef, menuRef])

  return {
    open,
    toggle: () => setOpen((o) => !o),
    // Scroll must be unlocked before the click reaches the #colorways handler in App.jsx.
    closeNow: () => flushSync(() => setOpen(false)),
  }
}

// Nav is shared with the auth pages, so in-page anchors point at the landing; real paths stay as they are.
const home = (href) => (href.startsWith('#') ? `/${href}` : href)
const homeCta = { ...NAV.cta, href: home(NAV.cta.href) }

// `cart` is an optional slot (the shop pages pass the cart button); the landing renders none.
export default function Nav({ cart }) {
  const ref = useNavTheme()
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const { open, toggle, closeNow } = useMobileMenu(buttonRef, menuRef)
  return (
    <>
      <nav ref={ref} className={open ? 'nav open' : 'nav'} data-theme="dark" aria-label="Primary">
        <Link className="nav-brand" to={home('#story')}>{BRAND}</Link>
        <ul className="nav-links">
          {NAV.links.map(({ label, href }) => (
            <li key={href}>
              <Link to={home(href)}>{label}</Link>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {cart}
          <NavAuth />
          <Cta {...homeCta} />
          <button
            ref={buttonRef}
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={toggle}
          >
            <span className="menu-label">{open ? NAV.close : NAV.menu}</span>
            <i className="menu-icon" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <div id="mobile-menu" ref={menuRef} className={open ? 'menu open' : 'menu'} inert={!open} role="dialog" aria-modal="true" aria-label={NAV.menu}>
        <ul>
          {NAV.links.map(({ label, href }) => (
            <li key={href}>
              <Link to={home(href)} onClick={closeNow}>{label}</Link>
            </li>
          ))}
        </ul>
        <div className="menu-foot">
          <NavAuth onNavigate={closeNow} />
          <Cta {...homeCta} />
          <p>{BRAND} / {ORIGIN}</p>
        </div>
      </div>
    </>
  )
}
