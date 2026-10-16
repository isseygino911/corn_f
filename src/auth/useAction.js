import { useRef, useState } from 'react'

// Runs an async function and tracks its pending / error / result state. run() resolves to the result, or undefined on failure.
// A second run() while one is in flight is ignored, so a double click or key repeat cannot submit twice.
export function useAction(fn) {
  const [state, setState] = useState({ pending: false, error: null, result: null })
  const busy = useRef(false)
  const run = async (...args) => {
    if (busy.current) return
    busy.current = true
    setState({ pending: true, error: null, result: null })
    try {
      const result = await fn(...args)
      setState({ pending: false, error: null, result })
      return result
    } catch (error) {
      setState({ pending: false, error, result: null })
    } finally {
      busy.current = false
    }
  }
  return { ...state, run }
}
