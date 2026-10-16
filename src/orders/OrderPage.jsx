import { Link, useLocation, useParams } from 'react-router'
import { Check, X } from 'lucide-react'
import { api } from '../api.js'
import { formatMoney, useLoad } from '../panel/ui.jsx'
import ShopShell, { PageTitle } from '../shop/ShopShell.jsx'
import { Loaded } from '../shop/Shop.jsx'
import { Reveal, SuccessCheck } from '../shop/motion.jsx'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatAddress } from './format.js'
import RequireUser from './RequireUser.jsx'
import { Totals } from './Totals.jsx'

const STEPS = [
  { status: 'placed', label: 'Placed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
]
const dateTime = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

// Placed → shipped → delivered, or a cancelled end state. Dates are only known for placed and the current status.
function Timeline({ order }) {
  const cancelled = order.status === 'cancelled'
  const reached = STEPS.findIndex((s) => s.status === order.status)
  const steps = cancelled ? [STEPS[0], { status: 'cancelled', label: 'Cancelled' }] : STEPS
  return (
    <ol className="tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-4 tw:p-0 tw:sm:flex-row tw:sm:gap-8" aria-label="Order status">
      {steps.map((s, i) => {
        const done = cancelled ? true : i <= reached
        const at = s.status === 'placed' ? order.placedAt : s.status === order.status ? order.statusUpdatedAt : null
        return (
          <Reveal key={s.status} index={i} className="tw:flex tw:items-center tw:gap-3" aria-current={s.status === order.status ? 'step' : undefined}>
            <span className={cn('tw:grid tw:size-8 tw:place-items-center tw:rounded-full tw:border', s.status === 'cancelled' ? 'tw:border-destructive tw:bg-destructive tw:text-white' : done ? 'tw:border-primary tw:bg-primary tw:text-primary-foreground' : 'tw:border-border')}>
              {s.status === 'cancelled' ? <X size={16} /> : done && <Check size={16} />}
            </span>
            <span className="tw:flex tw:flex-col">
              <span className={cn('tw:font-mono tw:text-xs tw:uppercase', !done && 'tw:text-muted-foreground')}>{s.label}</span>
              {at && <span className="tw:text-sm tw:text-muted-foreground">{dateTime(at)}</span>}
            </span>
          </Reveal>
        )
      })}
    </ol>
  )
}

function Order({ order }) {
  const justPlaced = useLocation().state?.placed
  return (
    <>
      <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-3">
        {justPlaced && <SuccessCheck />}
        <PageTitle>{order.orderNumber}</PageTitle>
        <Badge variant={order.status === 'cancelled' ? 'destructive' : 'secondary'}>{order.status}</Badge>
      </div>
      <p>Placed {dateTime(order.placedAt)}. A confirmation was sent to {order.email}; payment instructions follow.</p>
      <Timeline order={order} />
      <div className="tw:grid tw:w-full tw:grid-cols-1 tw:gap-8 tw:md:grid-cols-[minmax(0,1fr)_320px]">
        <section className="tw:flex tw:flex-col tw:gap-4">
          <h2 className="tw:text-2xl">Items</h2>
          <ul className="tw:m-0 tw:flex tw:list-none tw:flex-col tw:divide-y tw:divide-border tw:p-0">
            {order.items.map((item, i) => (
              <li key={i} className="tw:flex tw:justify-between tw:gap-4 tw:py-3">
                <span>
                  <strong className="tw:font-medium">{item.quantity} × {item.name}</strong>
                  <span className="tw:block tw:font-mono tw:text-xs tw:text-muted-foreground tw:uppercase">{item.sku} · {formatMoney(item.unitCents)} each</span>
                  {item.accessories.map((a) => (
                    <span key={a.sku} className="tw:block tw:font-mono tw:text-xs tw:text-muted-foreground tw:uppercase">+ {a.name} ({formatMoney(a.unitCents)})</span>
                  ))}
                </span>
                <span>{formatMoney(item.lineCents)}</span>
              </li>
            ))}
          </ul>
        </section>
        <aside className="tw:flex tw:h-fit tw:flex-col tw:gap-4 tw:rounded-2xl tw:border tw:border-border tw:bg-card tw:p-5">
          <Totals {...order} />
          <div>
            <h3 className="tw:mb-1 tw:font-mono tw:text-xs tw:uppercase">Ships to</h3>
            <p>{order.address.fullName}</p>
            <p>{formatAddress(order.address)}</p>
            <div className="tw:text-sm tw:text-muted-foreground">{order.address.phone}</div>
          </div>
        </aside>
      </div>
      <Button asChild variant="outline" className="tw:self-start tw:text-foreground"><Link to="/account/orders">All orders</Link></Button>
    </>
  )
}

export default function OrderPage() {
  const { orderNumber } = useParams()
  const load = useLoad(() => api.get(`/orders/${orderNumber}`), [orderNumber])
  return (
    <RequireUser>
      <ShopShell>
        <Loaded load={load} skeleton={<Skeleton className="tw:h-64 tw:w-full" />}>
          {({ order }) => <Order order={order} />}
        </Loaded>
      </ShopShell>
    </RequireUser>
  )
}
