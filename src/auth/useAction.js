import { useState } from 'react'

// Runs an async function and tracks its pending / error / result state. run() resolves to the result, or undefined on failure.
export function useAction(fn) {
  const [state, setState] = useState({ pending: false, error: null, result: null })
  const run = async (...args) => {
    setState({ pending: true, error: null, result: null })
    try {
      const result = await fn(...args)
      setState({ pending: false, error: null, result })
      return result
    } catch (error) {
      setState({ pending: false, error, result: null })
    }
  }
  return { ...state, run }
}
