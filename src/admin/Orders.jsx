import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { api } from '../api.js'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs'
import { ConfirmButton, DataTable, Empty, Heading, Loaded, OrderStatus, ORDER_STATUSES, Pager, SelectField, linkButton, formatDate, formatMoney, useLoad } from '../panel/ui.jsx'

const COLUMNS = [
  { label: 'Order', cell: (o) => <Link className="tw:underline" to={`/admin/orders/${o.id}`}>{o.orderNumber}</Link> },
  { label: 'Customer', cell: (o) => o.email },
  { label: 'Placed', cell: (o) => formatDate(o.placedAt) },
  { label: 'Status', cell: (o) => <OrderStatus status={o.status} /> },
  { label: 'Total', cell: (o) => formatMoney(o.totalCents) },
]

export function OrdersList() {
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const params = new URLSearchParams({ page })
  if (status !== 'all') params.set('status', status)
  if (term) params.set('q', term)
  const load = useLoad(() => api.get(`/admin/orders?${params}`), [status, term, page])
  return (
    <>
      <Heading>Orders</Heading>
      <Tabs value={status} onValueChange={(s) => { setStatus(s); setPage(1) }}>
        <TabsList className="tw:h-auto tw:flex-wrap">
          {['all', ...ORDER_STATUSES].map((s) => <TabsTrigger key={s} value={s} className="tw:font-mono tw:text-xs tw:uppercase">{s}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <form
        className="tw:flex tw:flex-wrap tw:items-end tw:gap-2"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          setTerm(q.trim())
        }}
      >
        <div className="tw:flex tw:min-w-0 tw:flex-1 tw:flex-col tw:gap-2 tw:sm:max-w-sm">
          <Label htmlFor="order-search">Search order number or email</Label>
          <Input id="order-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button>Search</Button>
      </form>
      <Loaded load={load}>
        {({ orders, total, pageSize }) => (
          <>
            {orders.length ? <DataTable columns={COLUMNS} rows={orders} /> : <Empty>No orders found.</Empty>}
            <Pager page={page} total={total} pageSize={pageSize} onPage={setPage} />
          </>
        )}
      </Loaded>
    </>
  )
}

// Forward steps only; cancelling has its own confirmed button.
const NEXT = { placed: 'shipped', shipped: 'delivered' }
const CANCELLABLE = ['placed', 'shipped']

const Section = ({ title, children }) => (
  <section className="tw:flex tw:flex-col tw:gap-2 tw:rounded-2xl tw:border tw:p-4">
    <h3 className="tw:font-mono tw:text-xs tw:uppercase tw:font-normal">{title}</h3>
    {children}
  </section>
)

const Total = ({ label, cents, strong }) => (
  <div className={`tw:flex tw:justify-between tw:gap-4 ${strong ? 'tw:border-t tw:pt-2 tw:font-medium' : ''}`}>
    <span>{label}</span>
    <span>{formatMoney(cents)}</span>
  </div>
)

function OrderDetail({ order, onChange }) {
  const { address: a } = order
  const setStatus = async (status) => {
    await api.patch(`/admin/orders/${order.id}/status`, { status })
    toast.success(`Order ${order.orderNumber} is now ${status}.`)
    onChange()
  }
  const next = NEXT[order.status]
  return (
    <>
      <Heading action={<OrderStatus status={order.status} />}>{order.orderNumber}</Heading>
      <p>{order.email} · placed {formatDate(order.placedAt)}</p>
      {(next || CANCELLABLE.includes(order.status)) && (
        <div className="tw:flex tw:flex-wrap tw:items-end tw:gap-2">
          {next && (
            <SelectField
              label="Status"
              className="tw:w-48"
              value={order.status}
              onValueChange={(s) => setStatus(s).catch((e) => toast.error(e.message))}
              options={[order.status, next].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
            />
          )}
          <ConfirmButton
            label="Cancel order"
            confirm="Cancel order"
            size="default"
            title={`Cancel ${order.orderNumber}?`}
            description="The items go back into stock. This cannot be undone."
            action={() => setStatus('cancelled')}
          />
        </div>
      )}
      <Section title="Items">
        <ul className="tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-3 tw:p-0">
          {order.items.map((it) => (
            <li key={it.sku} className="tw:flex tw:flex-col tw:gap-1">
              <div className="tw:flex tw:justify-between tw:gap-4">
                <span>{it.name} × {it.quantity}</span>
                <span>{formatMoney(it.lineCents)}</span>
              </div>
              {it.accessories.map((ac) => (
                <span key={ac.sku} className="tw:pl-4 tw:text-muted-foreground">+ {ac.name} ({formatMoney(ac.unitCents)} each)</span>
              ))}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Totals">
        <Total label="Subtotal" cents={order.subtotalCents} />
        <Total label="Shipping" cents={order.shippingCents} />
        <Total label={`Tax (${order.taxRateBps / 100}%)`} cents={order.taxCents} />
        <Total label="Total" cents={order.totalCents} strong />
      </Section>
      <Section title="Ship to">
        <p>{a.fullName} · {a.phone}</p>
        <p>{[a.line1, a.line2, a.city, a.stateCode, a.postalCode, a.countryCode].filter(Boolean).join(', ')}</p>
      </Section>
      <Link className={linkButton({ variant: 'outline' }, 'tw:self-start')} to="/admin/orders">Back to orders</Link>
    </>
  )
}

export function OrderPage() {
  const { id } = useParams()
  const load = useLoad(() => api.get(`/admin/orders/${id}`), [id])
  return <Loaded load={load}>{({ order }) => <OrderDetail order={order} onChange={load.reload} />}</Loaded>
}
