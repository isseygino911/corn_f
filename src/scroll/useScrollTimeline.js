import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { COLORWAYS } from '../colorways.js'
import { BEAT_START, SCROLL_LENGTH } from './beats.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const BLUR_OUT = 'blur(16px)'
const BLUR_IN = 'blur(0px)'
const MOVE = 0.4 // scroll spent sliding between colorways
const STRIDE = 0.8 // MOVE plus an equal hold on each colorway
const LAST = COLORWAYS.length - 1

// Times are in viewport-heights of scroll from the top of #story, anchored to BEAT_START.
// Colorway i is fully shown at colorwayTime(i); its slide in runs for MOVE before that.
const colorwayTime = (i) => BEAT_START.colorways + 0.5 + i * STRIDE

const fadeIn = (tl, target, at, from = {}) =>
  tl.fromTo(target, { autoAlpha: 0, y: 40, filter: BLUR_OUT, ...from }, { autoAlpha: 1, y: 0, filter: BLUR_IN, duration: 0.5 }, at)
const fadeOut = (tl, target, at) =>
  tl.to(target, { autoAlpha: 0, y: -40, filter: BLUR_OUT, duration: 0.5 }, at)

// Hero cursor parallax: the cob drifts against the pointer, the headline follows it a little. Fine pointers only.
const parallax = () => {
  if (!matchMedia('(pointer: fine)').matches) return
  const cobs = gsap.utils.toArray('.parallax').map((el) => ({
    cob: el.parentElement,
    x: gsap.quickTo(el, 'x', { duration: 1.2 }),
    y: gsap.quickTo(el, 'y', { duration: 1.2 }),
    r: gsap.quickTo(el, 'rotation', { duration: 1.2 }),
  }))
  const text = gsap.quickTo('#hero .pin', 'x', { duration: 1.2 })
  const onMove = ({ clientX, clientY }) => {
    const px = clientX / innerWidth - 0.5
    const py = clientY / innerHeight - 0.5
    cobs.forEach(({ cob, x, y, r }) => {
      const depth = gsap.getProperty(cob, 'scale') // nearer cobs drift further
      x(px * -48 * depth)
      y(py * -32 * depth)
      r(px * 2 * depth)
    })
    text(px * 14)
  }
  addEventListener('pointermove', onMove)
  return () => removeEventListener('pointermove', onMove)
}

// The hero cobs ride an ellipse seen from the front: phase 0 puts the first cob at the front, and each
// extra turn of progress sends them clockwise (on screen) round it. The front cob is largest and sharpest.
const ORBIT_TURNS = 1
const orbit = (progress) => {
  const cobs = gsap.utils.toArray('.cob')
  cobs.forEach((cob, i) => {
    const a = Math.PI / 2 + (i / cobs.length + progress * ORBIT_TURNS) * 2 * Math.PI
    const depth = (Math.sin(a) + 1) / 2 // 1 at the front, 0 at the back
    gsap.set(cob, {
      x: Math.cos(a) * 0.3 * innerWidth,
      y: (Math.sin(a) - 1) * 0.05 * innerHeight,
      scale: 0.62 + 0.38 * depth,
      filter: `brightness(${0.55 + 0.45 * depth})`,
      zIndex: Math.round(depth * 10),
    })
    gsap.set(cob.querySelector('img'), { rotation: 12 * Math.cos(a) })
  })
}

function buildTimeline(onColorway) {
  const spin = { progress: 0 }
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true, onRefresh: () => orbit(spin.progress) },
  })
  const { craft, leaf, colorways } = BEAT_START
  const pin = (id) => `#${id} .pin`

  // 1. Hero: the cobs orbit clockwise for as long as the hero stays up (counter-clockwise when scrolling back),
  // while the headline fades up and away and the veil dims the scene under the craft text.
  orbit(0)
  tl.to(spin, { progress: 1, duration: leaf - 0.6, onUpdate: () => orbit(spin.progress) }, 0)
  tl.to(pin('hero'), { autoAlpha: 0, y: -30, duration: 0.5 }, 0.2)
  tl.to('.veil', { opacity: 0.7, duration: 1 }, 0.5)

  // 2. From our farm to your hands: text over the zoomed-in kernels, then they fog out into the leaf.
  fadeIn(tl, pin('craft'), craft - 0.3)
  fadeOut(tl, pin('craft'), leaf - 0.7)
  tl.to('.hero-layer', { autoAlpha: 0, filter: 'blur(20px)', duration: 0.6 }, leaf - 0.6)

  // 3. Every kernel unique: dew-leaf macro with pulsing hotspots.
  tl.fromTo('.leaf', { autoAlpha: 0, filter: 'blur(20px)', scale: 1.08 }, { autoAlpha: 1, filter: BLUR_IN, scale: 1, duration: 0.8 }, leaf - 0.6)
  fadeIn(tl, pin('leaf'), leaf - 0.1)
  tl.fromTo('.hotspot i', { scale: 0 }, { scale: 1, duration: 0.3, stagger: 0.15 }, leaf + 0.3)
  fadeOut(tl, pin('leaf'), colorways - 0.7)
  tl.to('.leaf', { autoAlpha: 0, filter: 'blur(20px)', duration: 0.6 }, colorways - 0.5)

  // 4. Colorways: the light stage replaces the leaf; each colorway slides in from the right as the last slides out,
  // while the stage tint shifts to match.
  tl.fromTo('.harvest', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, colorways - 0.5)
  fadeIn(tl, pin('colorways'), colorways - 0.1)
  const cobs = gsap.utils.toArray('.harvest-cob')
  tl.fromTo(cobs[0], { autoAlpha: 0, x: 80, scale: 0.96 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.6 }, colorways - 0.1)
  tl.set('.harvest', { backgroundColor: COLORWAYS[0].tint }, 0)
  cobs.slice(1).forEach((cob, k) => {
    const at = colorwayTime(k + 1) - MOVE
    tl.to(cobs[k], { autoAlpha: 0, x: -80, scale: 0.96, duration: MOVE }, at)
    tl.fromTo(cob, { autoAlpha: 0, x: 80, scale: 0.96 }, { autoAlpha: 1, x: 0, scale: 1, duration: MOVE }, at)
    tl.to('.harvest', { backgroundColor: COLORWAYS[k + 1].tint, duration: MOVE }, at)
  })

  tl.eventCallback('onUpdate', () => {
    const i = Math.round((tl.time() - colorwayTime(0)) / STRIDE)
    onColorway(COLORWAYS[Math.min(LAST, Math.max(0, i))].id)
  })
  tl.set({}, {}, SCROLL_LENGTH) // pin the timeline length to the scroll distance so times stay in vh
  return tl
}

// Returns pickColorway(id): a swatch click scrolls to where the timeline has fully applied that colorway,
// so the scroll-scrubbed timeline stays the only writer of the selection.
export function useScrollTimeline(rootRef, lenisRef, onColorway) {
  const tlRef = useRef(null)
  useGSAP(
    () => {
      const stopParallax = parallax()
      tlRef.current = buildTimeline(onColorway)
      return stopParallax
    },
    { scope: rootRef },
  )

  return (id) => {
    const { start, end } = tlRef.current.scrollTrigger
    const time = colorwayTime(COLORWAYS.findIndex((c) => c.id === id))
    lenisRef.current.lenis.scrollTo(start + (time / SCROLL_LENGTH) * (end - start), { duration: 1.2 })
  }
}
