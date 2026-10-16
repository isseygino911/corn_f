import { COLLECTIONS } from '../copy.js'
import { useReveal } from '../scroll/useReveal.js'
import './flow-a.css'

export default function Collections({ fallback }) {
  const ref = useReveal(fallback)
  return (
    <section id="collections" className="collections" ref={ref}>
      <span className="chip chip-rose" data-reveal>{COLLECTIONS.eyebrow}</span>
      <h2 data-reveal>{COLLECTIONS.title}</h2>
      <div className="cards">
        {COLLECTIONS.items.map((item) => (
          <a key={item.tag} className="card" href={item.href} data-reveal>
            <img className="card-bg" src={item.bg} alt="" />
            <img className="card-cutout" src={item.cutout} alt="" />
            <span className="chip card-tag">{item.tag}</span>
            <span className="card-arrow" aria-hidden="true">↗</span>
            <h3>{item.title}</h3>
          </a>
        ))}
      </div>
    </section>
  )
}
