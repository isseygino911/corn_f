import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { api } from '../api.js'
import { Heading, Loaded, useLoad } from '../panel/ui.jsx'

// Counts up from 0 on mount; under reduced motion it shows the number straight away.
function CountUp({ value }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    const controls = animate(0, value, { duration: 0.6, ease: 'easeOut', onUpdate: (v) => (ref.current.textContent = Math.round(v)) })
    return () => controls.stop()
  }, [value, reduced])
  return <span ref={ref}>{reduced ? value : 0}</span>
}

export default function Dashboard() {
  const load = useLoad(() => api.get('/admin/dashboard'))
  return (
    <>
      <Heading>Dashboard</Heading>
      <Loaded load={load}>
        {(d) => (
          <div className="tw:grid tw:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] tw:gap-4">
            {[
              ['Users', d.users],
              ['Active products', d.products.active],
              ['Inactive products', d.products.inactive],
              ['Accessories', d.accessories],
              ['Sold out', d.soldOut],
            ].map(([label, n]) => (
              <div className="tw:flex tw:flex-col tw:gap-2 tw:rounded-2xl tw:border tw:p-5" key={label}>
                <b className="tw:text-[44px] tw:tabular-nums tw:leading-none tw:font-medium tw:tracking-[-0.05em]"><CountUp value={n} /></b>
                <span className="tw:font-mono tw:text-xs tw:uppercase">{label}</span>
              </div>
            ))}
          </div>
        )}
      </Loaded>
    </>
  )
}
