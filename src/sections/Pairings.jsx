import { useEffect, useRef, useState } from 'react'
import { PAIRINGS } from '../copy.js'
import { useReveal } from '../scroll/useReveal.js'
import './flow-b.css'

export default function Pairings({ fallback }) {
  const ref = useReveal(fallback)
  const track = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const sync = () => {
    const el = track.current
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }
  useEffect(sync, [])

  const step = (dir) => {
    const el = track.current
    const card = el.firstElementChild
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: fallback ? 'auto' : 'smooth' })
  }

  return (
    <section id="pairings" className="fb fb-pairings" ref={ref}>
      <div className="fb-head" data-reveal>
        <div className="fb-stack">
          <span className="chip chip-rose">{PAIRINGS.eyebrow}</span>
          <h2>{PAIRINGS.title}</h2>
        </div>
        <div className="fb-round-pair">
          <button type="button" className="fb-round" aria-label="Previous pairing" disabled={edge.start} onClick={() => step(-1)}>←</button>
          <button type="button" className="fb-round" aria-label="Next pairing" disabled={edge.end} onClick={() => step(1)}>→</button>
        </div>
      </div>
      <ul className="fb-track" ref={track} tabIndex={0} aria-label={PAIRINGS.title} onScroll={sync} data-reveal>
        {PAIRINGS.items.map((item, i) => (
          <li key={item.title} className="fb-card fb-pairing">
            <div className={item.cutout ? 'fb-panel is-cutout' : 'fb-panel'}>
              <img src={item.cutout ?? item.photo} alt={item.title} loading="lazy" />
            </div>
            <div className="fb-pairing-text">
              <span className="chip chip-mono">{String(i + 1).padStart(2, '0')} / {String(PAIRINGS.items.length).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <span className="fb-meta">{PAIRINGS.role}</span>
              <span className="fb-round fb-round-dark" aria-hidden="true">↗</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
