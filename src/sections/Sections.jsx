import { COLORWAYS } from '../colorways.js'
import { BEATS } from '../scroll/beats.js'
import { HERO, CRAFT, LEAF, COLORWAYS_COPY } from '../copy.js'
import { Cta } from './Nav.jsx'

const [HERO_BEAT, CRAFT_BEAT, LEAF_BEAT, COLORWAYS_BEAT] = BEATS

// Hotspot centres as % of the 3:2 dew-drop photo, one per LEAF.hotspots entry.
const HOTSPOTS = [[41, 29], [64, 28], [23, 54], [60, 79]]

const Chip = ({ accent, children }) => (
  <span className={accent ? 'chip chip-rose' : 'chip chip-mono'}>
    {children}
  </span>
)

const Chips = ({ items }) => (
  <div className="chips">
    {items.map((c) => (
      <Chip key={c}>{c}</Chip>
    ))}
  </div>
)

const Beat = ({ beat, fallback, className = '', children }) => (
  <section id={beat.id} className="beat" aria-labelledby={`${beat.id}-title`} style={fallback ? undefined : { height: `${beat.h * 100}vh` }}>
    <div className={`pin ${className}`}>{children}</div>
  </section>
)

// Numbered colorway list; arrow keys move the selection like a radio group.
function Picker({ colorway, onPick }) {
  const move = (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const i = COLORWAYS.findIndex((c) => c.id === colorway)
    onPick(COLORWAYS[(i + step + COLORWAYS.length) % COLORWAYS.length].id)
  }
  return (
    <ol className="pick" onKeyDown={move}>
      {COLORWAYS.map(({ id, name }, i) => (
        <li key={id}>
          <button type="button" aria-pressed={colorway === id} onClick={() => onPick(id)}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {name}
          </button>
        </li>
      ))}
    </ol>
  )
}

export default function Sections({ colorway, onPick, fallback }) {
  const current = COLORWAYS.find((c) => c.id === colorway)
  return (
    <main id="story" className={fallback ? 'static' : undefined}>
      <Beat beat={HERO_BEAT} fallback={fallback} className="center bottom">
        <h1 id="hero-title">{HERO.title}</h1>
        <Cta {...HERO.cta} />
        <span className="scroll-hint">
          <svg viewBox="0 0 12 18" width="12" height="18" fill="none" stroke="currentColor" aria-hidden="true">
            <rect x="0.5" y="0.5" width="11" height="17" rx="5.5" />
            <path d="M6 4v4" />
          </svg>
          {HERO.hint}
        </span>
      </Beat>

      <Beat beat={CRAFT_BEAT} fallback={fallback} className="center">
        <Chip accent>{CRAFT.eyebrow}</Chip>
        <h2 id="craft-title">{CRAFT.title}</h2>
        <p>{CRAFT.body}</p>
        <Chips items={CRAFT.chips} />
      </Beat>

      <Beat beat={LEAF_BEAT} fallback={fallback} className="left">
        <span className="mono-label">{LEAF.label}</span>
        <h2 id="leaf-title">{LEAF.title}</h2>
        <p>{LEAF.body}</p>
        <ul className="leaf-art">
          {LEAF.hotspots.map((text, i) => (
            <li key={text} className="hotspot" style={{ left: `${HOTSPOTS[i][0]}%`, top: `${HOTSPOTS[i][1]}%` }}>
              <i />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </Beat>

      <Beat beat={COLORWAYS_BEAT} fallback={fallback} className="left">
        <Chip accent>{COLORWAYS_COPY.eyebrow}</Chip>
        <h2 id="colorways-title">{COLORWAYS_COPY.title}</h2>
        <Picker colorway={colorway} onPick={onPick} />
        <div className="pick-info" key={current.id}>
          <p>{current.line}</p>
          <span className="dots">
            {current.dots.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
        </div>
        {fallback && <img className="static-shot" src={current.photo} alt={`${current.name} corn ornament`} />}
      </Beat>
    </main>
  )
}
