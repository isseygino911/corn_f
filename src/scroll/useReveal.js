import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Fade-up + blur reveal for every `[data-reveal]` inside the returned ref's element, staggered per batch.
// Pass `fallback` (reduced-motion static page) to leave everything visible.
export function useReveal(fallback = false) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (fallback) return
      gsap.set('[data-reveal]', { autoAlpha: 0, y: 40, filter: 'blur(12px)' })
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out', stagger: 0.08 }),
      })
    },
    { scope: ref },
  )
  return ref
}
