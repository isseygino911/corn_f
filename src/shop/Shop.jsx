import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { api } from '../api.js'
import { Message } from '../auth/ui.jsx'
import { useCart } from '../cart/CartContext.jsx'
import { formatMoney, useLoad } from '../panel/ui.jsx'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { Label } from '@/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Skeleton } from '@/ui/skeleton'
import ShopShell, { PageTitle } from './ShopShell.jsx'
import { Money, Reveal } from './motion.jsx'

const IMAGE = 'tw:aspect-3/4 tw:w-full tw:rounded-2xl tw:bg-muted tw:object-contain tw:object-center'

// Loading skeleton, then the error or the data.
export function Loaded({ load, skeleton, children }) {
  if (load.error) return <Message error>{load.error.message}</Message>
  if (load.loading) return skeleton
  return children(load.data)
}

const GridSkeleton = (
  <div className="tw:grid tw:w-full tw:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tw:gap-6" aria-busy="true">
    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="tw:aspect-3/4 tw:rounded-2xl" />)}
  </div>
)

export function ProductList() {
  const load = useLoad(() => api.get('/products'))
  return (
    <ShopShell>
      <PageTitle>Products</PageTitle>
      <Loaded load={load} skeleton={GridSkeleton}>
        {({ products }) =>
          products.length ? (
            <ul className="tw:m-0 tw:grid tw:w-full tw:list-none tw:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tw:gap-6 tw:p-0">
              {products.map((p, i) => (
                <Reveal key={p.publicId} index={i} hover>
                  <Link to={`/products/${p.slug}`} className="tw:group tw:flex tw:flex-col tw:gap-2 tw:text-foreground tw:no-underline">
                    {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" loading="lazy" className={IMAGE} /> : <div className={IMAGE} aria-hidden="true" />}
                    <strong className="tw:font-medium">{p.name}</strong>
                    <span className="tw:flex tw:items-center tw:gap-2 tw:font-mono tw:text-[13px] tw:uppercase">
                      {formatMoney(p.priceCents)}
                      {p.soldOut && <Badge variant="secondary">Sold out</Badge>}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          ) : (
            <p>Nothing is on the shelf yet.</p>
          )
        }
      </Loaded>
    </ShopShell>
  )
}

function Gallery({ images, name }) {
  const [current, setCurrent] = useState(images.find((i) => i.isMain) ?? images[0])
  if (!current) return <div className={IMAGE} role="img" aria-label={name} />
  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      <img className={IMAGE} src={current.url} alt={name} />
      {images.length > 1 && (
        <ul className="tw:m-0 tw:flex tw:list-none tw:flex-wrap tw:gap-2 tw:p-0">
          {images.map((i) => (
            <li key={i.url}>
              <button
                type="button"
                aria-label="Show image"
                aria-pressed={i === current}
                onClick={() => setCurrent(i)}
                className="tw:rounded-xl tw:border-2 tw:border-transparent tw:p-0 tw:aria-pressed:border-foreground"
              >
                <img src={i.url} alt="" className="tw:block tw:size-16 tw:rounded-[10px] tw:bg-muted tw:object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Detail({ product }) {
  const { add, setOpen } = useCart()
  const [picked, setPicked] = useState([])
  const [quantity, setQuantity] = useState(1)
  const { maxQuantity } = product
  const chosen = product.accessories.filter((a) => picked.includes(a.publicId))
  const total = (product.priceCents + chosen.reduce((sum, a) => sum + a.priceCents, 0)) * quantity

  const toggle = (id) => (checked) => setPicked((p) => (checked ? [...p, id] : p.filter((x) => x !== id)))
  const addToCart = () => {
    add({
      slug: product.slug,
      name: product.name,
      imageUrl: product.images.find((i) => i.isMain)?.url ?? product.images[0]?.url,
      unitCents: product.priceCents,
      accessories: chosen.map(({ publicId, name, priceCents }) => ({ publicId, name, priceCents })),
      quantity,
      maxQuantity,
    })
    setOpen(true)
  }

  return (
    <div className="tw:grid tw:w-full tw:grid-cols-1 tw:gap-6 tw:md:grid-cols-2 tw:md:gap-10">
      <Gallery images={product.images} name={product.name} />
      <div className="tw:flex tw:flex-col tw:items-start tw:gap-5">
        <h1 className="tw:text-[clamp(36px,5vw,56px)]">{product.name}</h1>
        <p>{product.description}</p>
        {product.soldOut ? (
          <Badge variant="secondary">Sold out</Badge>
        ) : (
          <>
            {product.accessories.length > 0 && (
              <fieldset className="tw:m-0 tw:flex tw:min-w-0 tw:flex-col tw:gap-3 tw:border-0 tw:p-0">
                <legend className="tw:pb-2 tw:font-mono tw:text-xs tw:uppercase">Add accessories</legend>
                {product.accessories.map((a) => (
                  <div key={a.publicId} className="tw:flex tw:items-center tw:gap-2.5">
                    <Checkbox id={a.publicId} disabled={a.soldOut} checked={picked.includes(a.publicId)} onCheckedChange={toggle(a.publicId)} />
                    <Label htmlFor={a.publicId} className="tw:text-base tw:normal-case tw:tracking-normal">
                      {a.name} · {a.soldOut ? 'Sold out' : `+${formatMoney(a.priceCents)}`}
                    </Label>
                  </div>
                ))}
              </fieldset>
            )}
            <div className="tw:flex tw:items-center tw:gap-3">
              <Label htmlFor="quantity">Quantity</Label>
              <Select value={String(quantity)} onValueChange={(v) => setQuantity(Number(v))}>
                <SelectTrigger id="quantity" className="tw:w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="tw:font-mono tw:text-[13px] tw:uppercase" aria-live="polite">
              Total (estimate) <b className="tw:ml-2 tw:font-sans tw:text-[40px] tw:leading-none tw:font-medium tw:tracking-tight"><Money cents={total} /></b>
            </p>
            <Button size="lg" className="tw:h-11 tw:px-8" onClick={addToCart}>Add to cart</Button>
          </>
        )}
      </div>
    </div>
  )
}

export function ProductPage() {
  const { slug } = useParams()
  const load = useLoad(() => api.get(`/products/${slug}`), [slug])
  return (
    <ShopShell>
      {load.error ? (
        <>
          <Message error>{load.error.message}</Message>
          <Button asChild variant="outline" className="tw:text-foreground"><Link to="/products">All products</Link></Button>
        </>
      ) : (
        <Loaded load={load} skeleton={<Skeleton className="tw:aspect-3/4 tw:w-full tw:max-w-md tw:rounded-2xl" />}>
          {({ product }) => <Detail key={product.publicId} product={product} />}
        </Loaded>
      )}
    </ShopShell>
  )
}
