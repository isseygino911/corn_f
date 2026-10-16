import { useRef } from 'react'
import { Message } from '../auth/ui.jsx'
import { useAction } from '../auth/useAction.js'
import { IMAGE_TYPES, uploadImage } from './uploads.js'

// `kind` is the upload type sent to the server. Ordered images [{ key, url, isMain }]. `max` 1 hides ordering and the main toggle (accessories).
export default function ImageUploader({ images, onChange, kind = 'product', max = 5 }) {
  const input = useRef(null)
  const single = max === 1
  const { run, pending, error } = useAction(async (file) => {
    const { key, url } = await uploadImage(file, kind)
    onChange(single ? [{ key, url, isMain: true }] : [...images, { key, url, isMain: !images.length }])
  })

  const pick = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (file) run(file)
  }
  const move = (i, d) => {
    const next = [...images]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  const remove = (i) => {
    const next = images.filter((_, j) => j !== i)
    if (next.length && !next.some((im) => im.isMain)) next[0] = { ...next[0], isMain: true }
    onChange(next)
  }
  const setMain = (i) => onChange(images.map((im, j) => ({ ...im, isMain: i === j })))

  return (
    <div className="uploader">
      <ul className="uploader-list">
        {images.map((im, i) => (
          <li key={im.key}>
            <img src={im.url} alt="" />
            <div className="actions">
              {!single && (
                <>
                  <button type="button" className="pill pill-sm" aria-pressed={im.isMain} onClick={() => setMain(i)}>{im.isMain ? 'Main' : 'Make main'}</button>
                  <button type="button" className="pill pill-sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier">←</button>
                  <button type="button" className="pill pill-sm" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Move later">→</button>
                </>
              )}
              <button type="button" className="pill pill-sm pill-danger" onClick={() => remove(i)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {(single || images.length < max) && (
        <>
          <input ref={input} type="file" accept={IMAGE_TYPES} hidden onChange={pick} />
          <button type="button" className="pill" disabled={pending} onClick={() => input.current.click()}>
            {pending ? 'Uploading…' : single && images.length ? 'Replace image' : 'Add image'}
          </button>
        </>
      )}
      {error && <Message error>{error.message}</Message>}
      <p>JPEG, PNG or WebP, up to 5 MB.</p>
    </div>
  )
}
