import { useLayoutEffect, useRef } from 'react'
import { BRAND, CTA, FOOTER } from '../copy.js'
import { useReveal } from '../scroll/useReveal.js'
import './flow-b.css'

export default function Footer({ fallback }) {
  const ref = useReveal(fallback)
  const brand = useRef(null)

  // Size the wordmark so it spans its box exactly on one line, whatever the font metrics.
  useLayoutEffect(() => {
    const box = brand.current
    const word = box.firstElementChild
    const fit = () => {
      box.style.fontSize = '100px'
      box.style.fontSize = `${(100 * box.clientWidth) / word.offsetWidth}px`
    }
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    document.fonts.ready.then(fit)
    return () => ro.disconnect()
  }, [])
  return (
    <section id="footer-cta" className="fb fb-footer" ref={ref}>
      <img className="fb-footer-bg" src="/photos/nature-dew.jpg" alt="" />
      <div className="fb-footer-inner">
        <h2 data-reveal>{CTA.title}</h2>
        <p data-reveal>{CTA.body}</p>
        <a className="fb-cta" href={CTA.button.href} data-reveal>
          {CTA.button.label}
          <span className="fb-cta-icon" aria-hidden="true">↗</span>
        </a>
      </div>
      <footer className="fb-footer-bar">
        <p className="fb-place">
          {FOOTER.places.map((place) => <span key={place}>{place}</span>)}
        </p>
        <nav className="fb-cols" aria-label="Footer">
          {FOOTER.columns.map((col) => (
            <div key={col.label}>
              <span className="fb-col-label">{col.label}</span>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="fb-copy">{FOOTER.copyright}</p>
        <button type="button" className="fb-top" onClick={() => window.scrollTo({ top: 0 })}>{FOOTER.top}</button>
      </footer>
      <div className="fb-brand" ref={brand} aria-hidden="true"><span>{BRAND}</span></div>
    </section>
  )
}
