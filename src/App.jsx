import { Component, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ReactLenis, useLenis } from 'lenis/react'
import { Navigate, Route, Routes } from 'react-router'
import Sections from './sections/Sections.jsx'
import Poster from './sections/Poster.jsx'
import Stage, { STAGE_IMAGES } from './sections/Stage.jsx'
import Nav from './sections/Nav.jsx'
import Flow from './sections/Flow.jsx'
import { COLORWAYS } from './colorways.js'
import { useScrollTimeline } from './scroll/useScrollTimeline.js'
import { useHashScroll } from './scroll/useHashScroll.js'
import { AuthProvider } from './auth/AuthContext.jsx'
import Gate from './auth/Gate.jsx'
import Login from './auth/Login.jsx'
import Signup from './auth/Signup.jsx'
import ForgotPassword from './auth/ForgotPassword.jsx'
import ResetPassword from './auth/ResetPassword.jsx'
import VerifyEmail from './auth/VerifyEmail.jsx'
import Account from './auth/Account.jsx'

const PRELOAD_TIMEOUT_MS = 6000

// Resolves true once every photo is decoded (or after a timeout, so a slow image never blocks the page).
function usePhotosReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const decoded = STAGE_IMAGES.map((src) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {})
    })
    Promise.race([Promise.all(decoded), new Promise((r) => setTimeout(r, PRELOAD_TIMEOUT_MS))]).then(() => setReady(true))
  }, [])
  return ready
}

history.scrollRestoration = 'manual'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const subscribeReducedMotion = (cb) => {
  reducedMotion.addEventListener('change', cb)
  return () => reducedMotion.removeEventListener('change', cb)
}
const getReducedMotion = () => reducedMotion.matches

// Any render failure in the animated story drops to the static page.
class StoryBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <StaticStory /> : this.props.children
  }
}

function Story() {
  const rootRef = useRef(null)
  const lenisRef = useRef(null)
  const [colorway, setColorway] = useState(COLORWAYS[0].id)
  const ready = usePhotosReady()
  const pick = useScrollTimeline(rootRef, lenisRef, setColorway)

  // Scroll is locked on the dark intro until the photos are ready.
  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('lenis-stopped', !ready)
    return () => html.classList.remove('lenis-stopped')
  }, [ready])

  const lenis = useLenis(ScrollTrigger.update)

  useHashScroll(
    (target) => (target.id === 'colorways' ? pick(COLORWAYS[0].id) : lenis.scrollTo(target, { duration: 1.2 })),
    !!lenis,
  )

  // #colorways is a pinned beat: its top is a blank blur, so land where the first colorway is fully shown.
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('a[href="#colorways"]')) return
      e.preventDefault()
      pick(COLORWAYS[0].id)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [pick])

  useEffect(() => {
    const tick = (t) => lenisRef.current?.lenis?.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div ref={rootRef}>
      <ReactLenis root ref={lenisRef} options={{ autoRaf: false }} />
      <Stage ready={ready} />
      <Nav />
      <Sections colorway={colorway} onPick={pick} />
      <Flow />
    </div>
  )
}

function StaticStory() {
  const [colorway, setColorway] = useState(COLORWAYS[0].id)
  useHashScroll((target) => target.scrollIntoView())
  return (
    <>
      <Poster />
      <Nav />
      <Sections colorway={colorway} onPick={setColorway} fallback />
      <Flow fallback />
    </>
  )
}

function Landing() {
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion)
  if (reduced) return <StaticStory />
  return (
    <StoryBoundary>
      <Story />
    </StoryBoundary>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Gate signedIn={false}><Login /></Gate>} />
        <Route path="/signup" element={<Gate signedIn={false}><Signup /></Gate>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/account" element={<Gate signedIn><Account /></Gate>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
