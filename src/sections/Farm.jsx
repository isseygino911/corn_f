import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { FARM } from '../copy.js'
import { useReveal } from '../scroll/useReveal.js'
import './flow-a.css'

gsap.registerPlugin(ScrollTrigger)

const { collage } = FARM
const COB = 'M60 6 C82 6 92 36 92 66 C92 96 80 114 60 114 C40 114 28 96 28 66 C28 36 38 6 60 6 Z'
const KERNEL_ROWS = Array.from({ length: 14 }, (_, i) => 14 + i * 7.6)
const FIELD = '/photos/nature-field.jpg'
const LEAF = '/photos/nature-corn-leaf.jpg'

export default function Farm({ fallback }) {
  const ref = useReveal(fallback)

  // Desktop only: each tile drifts by its own data-drift (px of travel across the collage).
  useGSAP(
    () => {
      if (fallback) return
      gsap.matchMedia().add('(min-width: 810px)', () => {
        gsap.utils.toArray('.farm-tile').forEach((tile) => {
          const drift = Number(tile.dataset.drift) / 2
          gsap.fromTo(
            tile,
            { y: -drift },
            { y: drift, ease: 'none', scrollTrigger: { trigger: '.farm-board', start: 'top bottom', end: 'bottom top', scrub: true } },
          )
        })
      })
    },
    { scope: ref },
  )

  return (
    <section id="farm" ref={ref}>
      <div className="farm-statement">
        <img className="farm-backdrop" src={FARM.backdrop} alt="" />
        <span className="chip chip-rose" data-reveal>{FARM.eyebrow}</span>
        <h2 data-reveal>{FARM.title}</h2>
        <p data-reveal>{FARM.body}</p>
      </div>
      <div className="farm-board">
        <div className="farm-head">
          <span className="chip chip-moss" data-reveal>{collage.eyebrow}</span>
          <h2 data-reveal>{collage.title}</h2>
          <p data-reveal>{collage.body}</p>
        </div>
        <div className="farm-tile tile-line" data-drift="-60">
          <svg viewBox="0 0 120 120" aria-hidden="true" data-reveal>
            <defs>
              <clipPath id="cob-clip"><path d={COB} /></clipPath>
            </defs>
            <path d={COB} />
            <g clipPath="url(#cob-clip)">
              {KERNEL_ROWS.map((y, r) =>
                [0, 1, 2, 3, 4, 5].map((c) => <ellipse key={`${r}-${c}`} cx={32 + c * 11 + (r % 2) * 5.5} cy={y} rx="4.6" ry="3.6" />),
              )}
            </g>
          </svg>
        </div>
        <div className="farm-tile tile-cutout" data-drift="-90">
          <img src={collage.cutout} alt="" data-reveal />
        </div>
        <div className="farm-tile tile-field" data-drift="50">
          <img src={FIELD} alt="" data-reveal />
        </div>
        <div className="farm-tile tile-dew" data-drift="70">
          <img src={collage.dew} alt="" data-reveal />
        </div>
        <div className="farm-tile tile-kernels" data-drift="-40">
          <div data-reveal>
            <span className="mono-label">{collage.kernels.label}</span>
            <strong>{collage.kernels.value}</strong>
          </div>
        </div>
        <div className="farm-tile tile-cap" data-drift="90">
          <div data-reveal>
            <span className="mono-label">{collage.cap.label}</span>
            <strong>{collage.cap.value}</strong>
          </div>
        </div>
        <div className="farm-tile tile-stat" data-drift="-50">
          <div data-reveal>
            <span className="mono-label">{collage.stat.label}</span>
            <strong>{collage.stat.value}</strong>
          </div>
        </div>
        <div className="farm-tile tile-leaf" data-drift="-80">
          <img src={LEAF} alt="" data-reveal />
        </div>
        <div className="farm-tile tile-note" data-drift="110">
          <div data-reveal>
            <strong>{collage.note.value}</strong>
            <span className="mono-label">{collage.note.label}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
