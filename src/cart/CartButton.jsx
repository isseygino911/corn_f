import { Link } from 'react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/ui/button'
import { Surface, TONE_CYCLE } from '@/ui/surface'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/ui/sheet'
import { formatMoney } from '../panel/ui.jsx'
import { Money, Reveal } from '../shop/motion.jsx'
import { lineCents, useCart } from './CartContext.jsx'
import './cart.css'
import '../shop/shop.css'

function Line({ line, index }) {
  const { setQuantity, remove } = useCart()
  return (
    <Reveal x={16} className="cart-line">
      <Surface tone={TONE_CYCLE[index % TONE_CYCLE.length]} className="tw:flex tw:gap-3 tw:p-3">
      {line.imageUrl ? (
        <img src={line.imageUrl} alt="" className="tw:size-20 tw:shrink-0 tw:rounded-2xl tw:bg-background/50 tw:object-contain tw:object-center" />
      ) : (
        <div className="tw:size-20 tw:shrink-0 tw:rounded-2xl tw:bg-background/50" aria-hidden="true" />
      )}
      <div className="tw:flex tw:min-w-0 tw:flex-1 tw:flex-col tw:gap-1">
        <Link to={`/products/${line.slug}`} className="tw:font-medium tw:text-foreground tw:no-underline">{line.name}</Link>
        {line.accessories.map((a) => (
          <span key={a.publicId} className="tw:font-mono tw:text-xs tw:uppercase tw:opacity-70">+ {a.name}</span>
        ))}
        <div className="tw:mt-auto tw:flex tw:items-center tw:justify-between tw:gap-2">
          <div className="tw:flex tw:items-center tw:gap-1">
            <Button variant="outline" size="icon-xs" aria-label={`Decrease quantity of ${line.name}`} disabled={line.quantity <= 1} onClick={() => setQuantity(line.key, line.quantity - 1)}>
              <Minus />
            </Button>
            <span className="tw:w-6 tw:text-center tw:text-sm" aria-live="polite">{line.quantity}</span>
            <Button variant="outline" size="icon-xs" aria-label={`Increase quantity of ${line.name}`} disabled={line.quantity >= line.maxQuantity} onClick={() => setQuantity(line.key, line.quantity + 1)}>
              <Plus />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label={`Remove ${line.name}`} onClick={() => remove(line.key)}>
              <Trash2 />
            </Button>
          </div>
          <span className="tw:text-sm">{formatMoney(lineCents(line))}</span>
        </div>
      </div>
      </Surface>
    </Reveal>
  )
}

// Nav slot: bag button with a count badge, plus the drawer it opens.
export default function CartButton() {
  const { lines, count, subtotalCents, open, setOpen } = useCart()
  return (
    <>
      <button type="button" className="cart-btn" aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`} onClick={() => setOpen(true)}>
        <ShoppingBag size={20} aria-hidden="true" />
        {count > 0 && <span className="cart-badge">{count}</span>}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="ui tw:w-full tw:sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="tw:text-3xl">Your cart</SheetTitle>
            <SheetDescription>Prices are estimates until checkout.</SheetDescription>
          </SheetHeader>
          {lines.length ? (
            <ul className="tw:m-0 tw:flex-1 tw:flex tw:list-none tw:flex-col tw:gap-3 tw:overflow-y-auto tw:px-4 tw:py-0">
              {lines.map((l, i) => <Line key={l.key} line={l} index={i} />)}
            </ul>
          ) : (
            <div className="tw:flex tw:flex-1 tw:flex-col tw:items-start tw:gap-4 tw:px-4">
              <p>Your cart is empty.</p>
              <Button asChild variant="outline" className="tw:text-foreground" onClick={() => setOpen(false)}>
                <Link to="/products">Browse products</Link>
              </Button>
            </div>
          )}
          {lines.length > 0 && (
            <SheetFooter className="tw:gap-3 tw:rounded-t-3xl tw:bg-surface-dark tw:p-5 tw:text-primary-foreground">
              <p className="tw:flex tw:items-baseline tw:justify-between tw:font-mono tw:text-xs tw:uppercase">
                Subtotal <b className="tw:font-sans tw:text-2xl tw:font-medium"><Money cents={subtotalCents} /></b>
              </p>
              <div className="tw:text-sm tw:opacity-70">Shipping and tax at checkout</div>
              <Button asChild variant="invert" size="lg" className="tw:h-11" onClick={() => setOpen(false)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
