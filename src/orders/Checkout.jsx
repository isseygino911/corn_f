import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { api } from '../api.js'
import { Message } from '../auth/ui.jsx'
import { useAction } from '../auth/useAction.js'
import { useCart } from '../cart/CartContext.jsx'
import { formatMoney, useLoad } from '../panel/ui.jsx'
import ShopShell, { PageTitle } from '../shop/ShopShell.jsx'
import { Loaded } from '../shop/Shop.jsx'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { cn } from '@/lib/utils'
import AddressForm from './AddressForm.jsx'
import { formatAddress } from './format.js'
import RequireUser from './RequireUser.jsx'
import { Totals } from './Totals.jsx'

const toQuoteItems = (lines) => lines.map((l) => ({ slug: l.slug, accessoryIds: l.accessories.map((a) => a.publicId), quantity: l.quantity }))

function AddressPicker({ addresses, selectedId, onSelect, onAdd }) {
  const [adding, setAdding] = useState(!addresses.length)
  if (adding) {
    return (
      <AddressForm
        onSaved={(a) => {
          onAdd(a)
          setAdding(false)
        }}
        onCancel={addresses.length ? () => setAdding(false) : undefined}
      />
    )
  }
  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      <ul className="tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-3 tw:p-0" role="radiogroup" aria-label="Shipping address">
        {addresses.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              role="radio"
              aria-checked={a.id === selectedId}
              onClick={() => onSelect(a.id)}
              className={cn('tw:flex tw:w-full tw:flex-col tw:gap-1 tw:rounded-2xl tw:border tw:p-4 tw:text-left', a.id === selectedId ? 'tw:border-foreground tw:bg-card' : 'tw:border-border')}
            >
              <strong className="tw:font-medium">{a.fullName}</strong>
              <span>{formatAddress(a)}</span>
              <span className="tw:text-sm tw:text-muted-foreground">{a.phone}</span>
            </button>
          </li>
        ))}
      </ul>
      <Button variant="outline" className="tw:self-start" onClick={() => setAdding(true)}>Add a new address</Button>
    </div>
  )
}

function Summary({ quote, shippingEnabled }) {
  return (
    <aside className="tw:flex tw:h-fit tw:flex-col tw:gap-4 tw:rounded-2xl tw:border tw:border-border tw:bg-card tw:p-5" aria-label="Order summary">
      <h2 className="tw:text-2xl">Summary</h2>
      <ul className="tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-3 tw:p-0">
        {quote.data?.lines.map((l, i) => (
          <li key={i} className="tw:flex tw:justify-between tw:gap-3">
            <span>
              {l.quantity} × {l.name}
              {l.accessories.map((a) => <span key={a.publicId} className="tw:block tw:font-mono tw:text-xs tw:text-muted-foreground tw:uppercase">+ {a.name}</span>)}
            </span>
            <span>{formatMoney(l.lineCents)}</span>
          </li>
        ))}
      </ul>
      {quote.data ? <Totals {...quote.data} showShipping={shippingEnabled} /> : !quote.error && <Skeleton className="tw:h-24 tw:w-full" />}
    </aside>
  )
}

function CheckoutForm({ addresses: initial, shippingEnabled }) {
  const { lines, clear } = useCart()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState(initial)
  const [selectedId, setSelectedId] = useState((initial.find((a) => a.isDefault) ?? initial[0])?.id)
  const countryCode = addresses.find((a) => a.id === selectedId)?.countryCode
  const [quote, setQuote] = useState({ data: null, error: null })

  // The server prices the cart; ask again whenever the cart or the destination country changes.
  useEffect(() => {
    if (shippingEnabled && !countryCode) return
    let live = true
    setQuote({ data: null, error: null })
    api.post('/checkout/quote', { items: toQuoteItems(lines), countryCode }).then(
      (data) => live && setQuote({ data, error: null }),
      (error) => live && setQuote({ data: null, error }),
    )
    return () => {
      live = false
    }
  }, [lines, countryCode, shippingEnabled])

  const place = useAction(async () => {
    const { order } = await api.post('/orders', { items: toQuoteItems(lines), addressId: selectedId })
    navigate(`/orders/${order.orderNumber}`, { replace: true, state: { placed: true } })
    clear()
  })

  return (
    <div className="tw:grid tw:w-full tw:grid-cols-1 tw:gap-8 tw:md:grid-cols-[minmax(0,1fr)_360px]">
      <section className="tw:flex tw:flex-col tw:gap-4">
        <h2 className="tw:text-2xl">Shipping address</h2>
        <AddressPicker
          addresses={addresses}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={(a) => {
            setAddresses((all) => [...all, a])
            setSelectedId(a.id)
          }}
        />
      </section>
      <div className="tw:flex tw:flex-col tw:gap-4">
        <Summary quote={quote} shippingEnabled={shippingEnabled} />
        {quote.error && <Message error>{quote.error.message}</Message>}
        {place.error && <Message error>{place.error.message}</Message>}
        <Button size="lg" className="tw:h-12" disabled={place.pending || !selectedId || !quote.data} onClick={() => place.run()}>
          {place.pending ? 'Placing order…' : 'Place order'}
        </Button>
        <div className="tw:text-sm tw:text-muted-foreground">Payment instructions follow by email. Prices are confirmed when you place the order.</div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const { lines } = useCart()
  const addresses = useLoad(() => api.get('/account/addresses'))
  const settings = useLoad(() => api.get('/settings/storefront'))
  const both = { data: addresses.data && settings.data && { ...addresses.data, ...settings.data }, error: addresses.error ?? settings.error, loading: addresses.loading || settings.loading }
  return (
    <RequireUser>
      <ShopShell>
        <PageTitle>Checkout</PageTitle>
        {lines.length ? (
          <Loaded load={both} skeleton={<Skeleton className="tw:h-64 tw:w-full" />}>
            {({ addresses, shippingEnabled }) => <CheckoutForm addresses={addresses} shippingEnabled={shippingEnabled} />}
          </Loaded>
        ) : (
          <>
            <p>Your cart is empty.</p>
            <Button asChild variant="outline" className="tw:text-foreground"><Link to="/products">Browse products</Link></Button>
          </>
        )}
      </ShopShell>
    </RequireUser>
  )
}
