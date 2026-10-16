import { PROMISES } from '../copy.js'
import { useReveal } from '../scroll/useReveal.js'
import './flow-b.css'

export default function Values({ fallback }) {
  const ref = useReveal(fallback)
  return (
    <section id="promises" className="fb fb-values" ref={ref}>
      <div className="fb-stack" data-reveal>
        <span className="chip chip-rose">{PROMISES.eyebrow}</span>
        <h2>{PROMISES.title}</h2>
      </div>
      <ul className="fb-promises">
        {PROMISES.items.map((item, i) => (
          <li key={item.title} className="fb-card fb-promise" data-reveal>
            <span className="fb-num">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
