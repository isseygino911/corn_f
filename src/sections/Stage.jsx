import { COLORWAYS } from '../colorways.js'

export const cutout = (id) => `/cutouts/${id}.webp`
const LEAF_PHOTO = '/photos/nature-dew.jpg'
const HERO_BG = '/photos/nature-sunset.jpg'
// Hero cobs on the orbit, front one first (see orbit() in useScrollTimeline).
const HERO_COBS = ['autumn', 'pastel', 'cream'].map(cutout)

// Every image the stage needs, so the intro waits for them.
export const STAGE_IMAGES = [...HERO_COBS, HERO_BG, LEAF_PHOTO, ...COLORWAYS.map((c) => c.photo)]

// Fixed, scroll-driven dark layers behind the story text. Everything here is animated by useScrollTimeline.
export default function Stage({ ready }) {
  return (
    <div className={`stage${ready ? ' ready' : ''}`} aria-hidden="true">
      <div className="hero-layer">
        <img className="hero-bg" src={HERO_BG} alt="" />
        {HERO_COBS.map((src) => (
          <div key={src} className="cob">
            <div className="parallax">
              <img src={src} alt="" />
            </div>
          </div>
        ))}
        <div className="veil" />
      </div>
      <div className="leaf">
        <div className="leaf-art">
          <img src={LEAF_PHOTO} alt="" />
        </div>
        <div className="leaf-veil" />
      </div>
      <div className="harvest">
        {COLORWAYS.map(({ id, photo }) => (
          <img key={id} className="harvest-cob" src={photo} alt="" />
        ))}
      </div>
    </div>
  )
}
