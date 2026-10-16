import { cutout } from './Stage.jsx'

export default function Poster() {
  return (
    <div className="canvas-layer" aria-hidden="true">
      <img className="poster" src={cutout('ember')} alt="" />
    </div>
  )
}
