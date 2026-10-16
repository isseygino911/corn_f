import { useRef } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { useAction } from '../auth/useAction.js'
import { Actions } from '../panel/ui.jsx'
import { IMAGE_TYPES, uploadImage } from './uploads.js'

// `kind` is the upload type sent to the server. Ordered images [{ key, url, isMain }]. `max` 1 hides ordering and the main toggle (accessories).
export default function ImageUploader({ images, onChange, kind = 'product', max = 5 }) {
  const input = useRef(null)
  const single = max === 1
  const { run, pending } = useAction(async (file) => {
    try {
      const { key, url } = await uploadImage(file, kind)
      onChange(single ? [{ key, url, isMain: true }] : [...images, { key, url, isMain: !images.length }])
    } catch (error) {
      toast.error(error.message)
    }
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
    <div className="tw:flex tw:flex-col tw:items-start tw:gap-3">
      <ul className="tw:m-0 tw:flex tw:list-none tw:flex-wrap tw:gap-3 tw:p-0">
        {images.map((im, i) => (
          <li key={im.key} className="tw:flex tw:max-w-40 tw:flex-col tw:gap-2">
            <img src={im.url} alt="" className="tw:size-40 tw:rounded-2xl tw:bg-muted tw:object-contain" />
            <Actions>
              {!single && (
                <>
                  <Button type="button" variant={im.isMain ? 'default' : 'outline'} size="sm" aria-pressed={im.isMain} onClick={() => setMain(i)}>{im.isMain ? 'Main' : 'Make main'}</Button>
                  <Button type="button" variant="outline" size="icon-sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier"><ArrowLeftIcon /></Button>
                  <Button type="button" variant="outline" size="icon-sm" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Move later"><ArrowRightIcon /></Button>
                </>
              )}
              <Button type="button" variant="outline" size="sm" className="tw:hover:bg-destructive tw:hover:text-white" onClick={() => remove(i)}>Remove</Button>
            </Actions>
          </li>
        ))}
      </ul>
      {(single || images.length < max) && (
        <>
          <input ref={input} type="file" accept={IMAGE_TYPES} hidden onChange={pick} />
          <Button type="button" variant="outline" disabled={pending} onClick={() => input.current.click()}>
            {pending ? 'Uploading…' : single && images.length ? 'Replace image' : 'Add image'}
          </Button>
        </>
      )}
      <p>JPEG, PNG or WebP, up to 5 MB.</p>
    </div>
  )
}
