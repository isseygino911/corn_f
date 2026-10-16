import { useEffect } from 'react'
import { useLocation } from 'react-router'

// Router navigation to /#id does not scroll by itself (nor does a first load, as the page renders client-side):
// hand the target element to scrollTo whenever the location, or just its hash, is visited (once `ready`).
export function useHashScroll(scrollTo, ready = true) {
  const { hash, key } = useLocation()
  useEffect(() => {
    const target = document.getElementById(hash.slice(1))
    if (ready && target) scrollTo(target)
  }, [hash, key, ready]) // scrollTo is a fresh closure every render; only a visit should scroll
}
