import { useEffect, useRef } from 'react'
import { animate, motion, useReducedMotion } from 'motion/react'
import { formatMoney } from '../panel/ui.jsx'

const FAST = { duration: 0.3, ease: 'easeOut' }

// Fade-up on mount, staggered by `index` (capped so long lists stay quick). Plain element when motion is reduced.
export function Reveal({ as = 'li', index = 0, x = 0, className, children, hover = false, ...rest }) {
  const reduced = useReducedMotion()
  const Tag = motion[as]
  if (reduced) return <Tag className={className} {...rest}>{children}</Tag>
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: x ? 0 : 16, x }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ ...FAST, delay: Math.min(index, 8) * 0.05 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// Money that ticks to its new value instead of jumping.
export function Money({ cents }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const shown = useRef(cents)
  useEffect(() => {
    if (reduced || shown.current === cents) {
      shown.current = cents
      return
    }
    const controls = animate(shown.current, cents, {
      duration: 0.35,
      ease: 'easeOut',
      onUpdate: (v) => {
        shown.current = v
        ref.current.textContent = formatMoney(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [cents, reduced])
  return <span ref={ref}>{formatMoney(cents)}</span>
}

// Circled check that draws itself.
export function SuccessCheck() {
  const reduced = useReducedMotion()
  const draw = (delay) => (reduced ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.35, delay, ease: 'easeOut' } })
  return (
    <svg viewBox="0 0 52 52" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Order placed">
      <motion.circle cx="26" cy="26" r="22" {...draw(0)} />
      <motion.path d="m16 27 7 7 14-15" {...draw(0.25)} />
    </svg>
  )
}
