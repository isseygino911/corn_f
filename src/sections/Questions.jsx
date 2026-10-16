import { useState } from 'react'
import { QUESTIONS } from '../copy.js'
import { useReveal } from '../scroll/useReveal.js'
import './flow-b.css'

export default function Questions({ fallback }) {
  const ref = useReveal(fallback)
  const [open, setOpen] = useState(null)
  return (
    <section id="questions" className="fb fb-questions" ref={ref}>
      <div className="fb-stack" data-reveal>
        <span className="chip chip-rose">{QUESTIONS.eyebrow}</span>
        <h2>{QUESTIONS.title}</h2>
      </div>
      <ul className="fb-faq" data-reveal>
        {QUESTIONS.items.map((item, i) => {
          const isOpen = open === i
          return (
            <li key={item.q} className={isOpen ? 'is-open' : undefined}>
              <h3>
                <button type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                  {item.q}
                  <span className="fb-plus" aria-hidden="true" />
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="fb-faq-panel">
                <p>{item.a}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
