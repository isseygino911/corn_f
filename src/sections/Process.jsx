import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import { PROCESS } from '../copy.js'
import { useReveal } from '../scroll/useReveal.js'
import './flow-a.css'

gsap.registerPlugin(ScrollTrigger)

const num = (i) => String(i + 1).padStart(2, '0')

export default function Process({ fallback }) {
  const ref = useReveal(fallback)
  const trigger = useRef(null)
  const lenis = useLenis()
  const [active, setActive] = useState(0)
  const { steps } = PROCESS

  // Desktop only: the active step follows scroll through the tall section.
  useGSAP(
    () => {
      if (fallback) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 810px)', () => {
        trigger.current = ScrollTrigger.create({
          trigger: ref.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
        })
        return () => (trigger.current = null)
      })
    },
    { scope: ref },
  )

  // Pinned: scroll to the middle of that step's stretch. Stacked (mobile, reduced motion): scroll to its block.
  const goTo = (i) => {
    if (!trigger.current) return document.getElementById(`step-${i}`).scrollIntoView({ behavior: 'smooth' })
    const { start, end } = trigger.current
    lenis.scrollTo(start + ((i + 0.5) / steps.length) * (end - start), { duration: 1.2 })
  }

  return (
    <section id="process" className={fallback ? 'process is-static' : 'process'} ref={ref} style={{ '--steps': steps.length }}>
      <div className="process-stage">
        <header className="process-head">
          <span className="chip chip-rose" data-reveal>{PROCESS.eyebrow}</span>
          <h2 data-reveal>{PROCESS.title}</h2>
        </header>
        <div className="process-body">
          <ol className="process-rail" data-reveal>
            {steps.map((step, i) => (
              <li key={step.title}>
                <button type="button" aria-current={i === active} onClick={() => goTo(i)}>
                  <span>{num(i)}</span>
                  {step.title}
                </button>
              </li>
            ))}
          </ol>
          <div className="process-steps">
            {steps.map((step, i) => (
              <article key={step.title} id={`step-${i}`} className="process-step" data-active={i === active}>
                <div className="process-text">
                  <span className="process-num">{num(i)}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                <img className="process-img" src={step.cutout ?? step.photo} alt="" data-cutout={Boolean(step.cutout)} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
