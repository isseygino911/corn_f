import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { api } from '../api.js'
import { Message } from '../auth/ui.jsx'
import { useCart } from '../cart/CartContext.jsx'
import { formatMoney, useLoad } from '../panel/ui.jsx'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { PROCESS } from '../copy.js'
import { Checkbox } from '@/ui/checkbox'
import { Label } from '@/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Skeleton } from '@/ui/skeleton'
import { Surface, TONE_CYCLE } from '@/ui/surface'
import ShopShell from './ShopShell.jsx'
import { Money, Reveal } from './motion.jsx'

const IMAGE = 'tw:aspect-square tw:w-full tw:rounded-2xl tw:object-contain tw:object-center'
const toneAt = (i) => TONE_CYCLE[i % TONE_CYCLE.length]

// Loading skeleton, then the error or the data.
export function Loaded({ load, skeleton, children }) {
  if (load.error) return <Message error>{load.error.message}</Message>
  if (load.loading) return skeleton
  return children(load.data)
}

const GRID = 'tw:m-0 tw:grid tw:w-full tw:list-none tw:grid-cols-2 tw:gap-3 tw:p-0 tw:md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] tw:md:gap-5'

const GridSkeleton = (
  <div className={GRID} aria-busy="true">
    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="tw:aspect-4/5 tw:rounded-3xl" />)}
  </div>
)

const COLLECTIONS = [
  { value: '', label: 'All' },
  { value: 'charms', label: 'Charms' },
  { value: 'pearls', label: 'Pearls' },
]

function ProductCard({ product: p, index }) {
  return (
    <Reveal index={index} hover>
      <Surface as={Link} tone={toneAt(index)} to={`/products/${p.slug}`} className="tw:group tw:flex tw:h-full tw:flex-col tw:gap-3 tw:p-3 tw:text-foreground tw:no-underline tw:md:p-4">
        {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" loading="lazy" className={IMAGE} /> : <div className={IMAGE} aria-hidden="true" />}
        <span className="tw:flex tw:items-end tw:justify-between tw:gap-2 tw:px-1">
          <span className="tw:flex tw:min-w-0 tw:flex-col tw:gap-1">
            <strong className="tw:font-medium">{p.name}</strong>
            <span className="tw:flex tw:items-center tw:gap-2 tw:font-mono tw:text-[13px] tw:uppercase">
              {formatMoney(p.priceCents)}
              {p.soldOut && <Badge variant="secondary">Sold out</Badge>}
            </span>
          </span>
          <span className="tw:grid tw:size-9 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-primary tw:text-primary-foreground tw:transition-transform tw:group-hover:rotate-45" aria-hidden="true">
            <ArrowUpRight size={16} />
          </span>
        </span>
      </Surface>
    </Reveal>
  )
}

function ProductGrid({ products }) {
  return (
    <ul className={GRID}>
      {products.map((p, i) => <ProductCard key={p.publicId} product={p} index={i} />)}
    </ul>
  )
}

export function ProductList() {
  const [params, setParams] = useSearchParams()
  const collection = COLLECTIONS.some((c) => c.value && c.value === params.get('collection')) ? params.get('collection') : ''
  const load = useLoad(() => api.get(`/products${collection ? `?collection=${collection}` : ''}`), [collection])
  return (
    <ShopShell band={{ eyebrow: 'The collection', title: 'Products', intro: 'Real heirloom corn, made by hand in Yancheng and sealed in glass-bright resin.', art: '/cutouts/heirloom.webp' }}>
      <div className="tw:flex tw:flex-wrap tw:gap-2" role="group" aria-label="Collection">
        {COLLECTIONS.map((c) => (
          <Button key={c.label} size="lg" variant={c.value === collection ? 'default' : 'outline'} aria-pressed={c.value === collection} onClick={() => setParams(c.value ? { collection: c.value } : {})}>
            {c.label}
          </Button>
        ))}
      </div>
      <Loaded load={load} skeleton={GridSkeleton}>
        {({ products }) => (products.length ? <ProductGrid products={products} /> : <p>Nothing is on the shelf yet.</p>)}
      </Loaded>
    </ShopShell>
  )
}

function Gallery({ images, name }) {
  const [current, setCurrent] = useState(images.find((i) => i.isMain) ?? images[0])
  return (
    <div className="tw:flex tw:flex-col tw:gap-3 tw:self-start tw:md:sticky tw:md:top-24">
      <Surface tone="rose" className="tw:p-4 tw:md:p-8">
        {current ? <img className={IMAGE} src={current.url} alt={name} /> : <div className={IMAGE} role="img" aria-label={name} />}
      </Surface>
      {images.length > 1 && (
        <ul className="tw:m-0 tw:flex tw:list-none tw:flex-wrap tw:gap-2 tw:p-0">
          {images.map((i) => (
            <li key={i.url}>
              <button
                type="button"
                aria-label="Show image"
                aria-pressed={i === current}
                onClick={() => setCurrent(i)}
                className="tw:rounded-2xl tw:border-2 tw:border-transparent tw:p-0 tw:aria-pressed:border-foreground"
              >
                <img src={i.url} alt="" className="tw:block tw:size-16 tw:rounded-[14px] tw:bg-tint-sand tw:object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const TRUST = ['Handmade', 'Real corn', 'One of a kind']

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
        <ul className="tw:m-0 tw:flex tw:list-none tw:flex-wrap tw:gap-2 tw:p-0">
          {TRUST.map((t) => (
            <li key={t}><Badge variant="secondary" className="tw:px-3 tw:py-1 tw:font-mono tw:uppercase">{t}</Badge></li>
          ))}
        </ul>
        <p>{product.description}</p>
        {product.soldOut ? (
          <Badge variant="secondary">Sold out</Badge>
        ) : (
          <>
            {product.accessories.length > 0 && (
              <Surface as="fieldset" tone="mist" className="tw:m-0 tw:flex tw:w-full tw:min-w-0 tw:flex-col tw:gap-3 tw:border-0 tw:p-5">
                <legend className="tw:float-left tw:pb-1 tw:font-mono tw:text-xs tw:uppercase">Add accessories</legend>
                {product.accessories.map((a) => (
                  <div key={a.publicId} className="tw:flex tw:items-center tw:gap-2.5">
                    <Checkbox id={a.publicId} disabled={a.soldOut} checked={picked.includes(a.publicId)} onCheckedChange={toggle(a.publicId)} />
                    <Label htmlFor={a.publicId} className="tw:text-base tw:normal-case tw:tracking-normal">
                      {a.name} · {a.soldOut ? 'Sold out' : `+${formatMoney(a.priceCents)}`}
                    </Label>
                  </div>
                ))}
              </Surface>
            )}
            <Surface tone="dark" className="tw:flex tw:w-full tw:flex-col tw:gap-4 tw:p-5 tw:md:p-6">
              <div className="tw:flex tw:items-center tw:gap-3">
                <Label htmlFor="quantity">Quantity</Label>
                <Select value={String(quantity)} onValueChange={(v) => setQuantity(Number(v))}>
                  <SelectTrigger id="quantity" className="tw:w-20 tw:bg-background tw:text-foreground">
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
              <Button variant="invert" size="lg" className="tw:h-11 tw:self-start tw:px-8" onClick={addToCart}>Add to cart</Button>
            </Surface>
          </>
        )}
      </div>
    </div>
  )
}

// The landing page's five craft steps, as a dark strip of tinted tiles.
function HowItsMade() {
  return (
    <Surface as="section" tone="dark" className="tw:flex tw:flex-col tw:gap-6 tw:p-6 tw:md:p-10" aria-labelledby="made-title">
      <div className="tw:flex tw:flex-col tw:gap-2">
        <span className="tw:font-mono tw:text-xs tw:uppercase tw:text-accent">{PROCESS.eyebrow}</span>
        <h2 id="made-title" className="tw:text-[clamp(28px,4vw,44px)]!">{PROCESS.title}</h2>
      </div>
      <ol className="tw:m-0 tw:grid tw:list-none tw:grid-cols-1 tw:gap-3 tw:p-0 tw:sm:grid-cols-2 tw:lg:grid-cols-5">
        {PROCESS.steps.map((step, i) => (
          <Surface as="li" key={step.title} tone={toneAt(i)} className="tw:flex tw:flex-col tw:gap-2 tw:p-4 tw:text-foreground">
            <span className="tw:font-mono tw:text-xs">0{i + 1}</span>
            <strong className="tw:text-lg tw:font-medium">{step.title}</strong>
            <span className="tw:text-sm">{step.body}</span>
          </Surface>
        ))}
      </ol>
    </Surface>
  )
}

function Related({ product }) {
  const load = useLoad(() => api.get(`/products?collection=${product.collection}`), [product.collection])
  const others = (load.data?.products ?? []).filter((p) => p.publicId !== product.publicId).slice(0, 4)
  if (!others.length) return null
  return (
    <section className="tw:flex tw:flex-col tw:gap-4" aria-labelledby="related-title">
      <h2 id="related-title" className="tw:text-[clamp(28px,4vw,44px)]!">You may also like</h2>
      <ProductGrid products={others} />
    </section>
  )
}

export function ProductPage() {
  const { slug } = useParams()
  const load = useLoad(() => api.get(`/products/${slug}`), [slug])
  const product = load.data?.product
  return (
    <ShopShell className="tw:gap-12" band={{ eyebrow: product && (product.collection === 'pearls' ? 'Corn pearl' : 'Corn charm'), title: product?.name ?? 'Product' }}>
      {load.error ? (
        <>
          <Message error>{load.error.message}</Message>
          <Button asChild variant="outline" className="tw:self-start tw:text-foreground"><Link to="/products">All products</Link></Button>
        </>
      ) : (
        <Loaded load={load} skeleton={<Skeleton className="tw:aspect-3/4 tw:w-full tw:max-w-md tw:rounded-3xl" />}>
          {({ product }) => (
            <>
              <Detail key={product.publicId} product={product} />
              <HowItsMade />
              <Related product={product} />
            </>
          )}
        </Loaded>
      )}
    </ShopShell>
  )
}
