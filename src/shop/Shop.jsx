import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { api } from '../api.js'
import Nav from '../sections/Nav.jsx'
import { Message } from '../auth/ui.jsx'
import { useAction } from '../auth/useAction.js'
import { Check, Loaded, formatMoney, useLoad } from '../panel/ui.jsx'
import './shop.css'

const Page = ({ children }) => (
  <>
    <Nav />
    <main className="shop">{children}</main>
  </>
)

export function ProductList() {
  const load = useLoad(() => api.get('/products'))
  return (
    <Page>
      <h1>Products</h1>
      <Loaded load={load}>
        {({ products }) =>
          products.length ? (
            <ul className="shop-grid">
              {products.map((p) => (
                <li key={p.publicId}>
                  <Link to={`/products/${p.slug}`}>
                    {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" loading="lazy" /> : <div className="shop-ph" aria-hidden="true" />}
                    <strong>{p.name}</strong>
                    <span>{formatMoney(p.priceCents)}{p.soldOut && ' · Sold out'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-empty">Nothing is on the shelf yet.</p>
          )
        }
      </Loaded>
    </Page>
  )
}

function Gallery({ images, name }) {
  const [current, setCurrent] = useState(images.find((i) => i.isMain) ?? images[0])
  if (!current) return <div className="shop-ph" role="img" aria-label={name} />
  return (
    <div className="shop-gallery">
      <img className="shop-hero" src={current.url} alt={name} />
      {images.length > 1 && (
        <ul>
          {images.map((i) => (
            <li key={i.url}>
              <button type="button" aria-label="Show image" aria-pressed={i === current} onClick={() => setCurrent(i)}>
                <img src={i.url} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Detail({ product }) {
  const [picked, setPicked] = useState([])
  const quote = useAction((ids) => api.post(`/products/${product.slug}/quote`, { accessoryIds: ids }))
  const { run } = quote
  // The server is the source of truth for the total; refresh it whenever the selection changes.
  useEffect(() => {
    run(picked)
  }, [picked])

  const toggle = (id) => (e) => setPicked((p) => (e.target.checked ? [...p, id] : p.filter((x) => x !== id)))
  const total = quote.result?.totalCents ?? product.priceCents

  return (
    <div className="shop-detail">
      <Gallery images={product.images} name={product.name} />
      <div className="shop-info">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {product.soldOut ? (
          <p className="tag">Sold out</p>
        ) : (
          <>
            {product.accessories.length > 0 && (
              <fieldset className="panel-fieldset">
                <legend>Add accessories</legend>
                {product.accessories.map((a) => (
                  <Check
                    key={a.publicId}
                    label={`${a.name} · ${a.soldOut ? 'Sold out' : `+${formatMoney(a.priceCents)}`}`}
                    disabled={a.soldOut}
                    checked={picked.includes(a.publicId)}
                    onChange={toggle(a.publicId)}
                  />
                ))}
              </fieldset>
            )}
            <p className="shop-total" aria-live="polite">Total <b>{formatMoney(total)}</b></p>
            {quote.error && <Message error>{quote.error.message}</Message>}
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
    <Page>
      {load.error ? (
        <>
          <Message error>{load.error.message}</Message>
          <Link className="pill" to="/products">All products</Link>
        </>
      ) : (
        <Loaded load={load}>{({ product }) => <Detail key={product.publicId} product={product} />}</Loaded>
      )}
    </Page>
  )
}
