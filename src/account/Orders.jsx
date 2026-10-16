import { Link } from 'react-router'
import { api } from '../api.js'
import { DataTable, Empty, Heading, Loaded, OrderStatus, formatDate, formatMoney, linkButton, useLoad } from '../panel/ui.jsx'

const COLUMNS = [
  { label: 'Order', cell: (o) => <Link className="tw:underline" to={`/orders/${o.orderNumber}`}>{o.orderNumber}</Link> },
  { label: 'Placed', cell: (o) => formatDate(o.placedAt) },
  { label: 'Status', cell: (o) => <OrderStatus status={o.status} /> },
  { label: 'Total', cell: (o) => formatMoney(o.totalCents) },
]

export default function Orders() {
  const load = useLoad(() => api.get('/orders'))
  return (
    <>
      <Heading>Orders</Heading>
      <Loaded load={load}>
        {({ orders }) =>
          orders.length ? (
            <DataTable columns={COLUMNS} rows={orders} rowKey={(o) => o.orderNumber} />
          ) : (
            <>
              <Empty>No orders yet. When you buy something, it will show up here.</Empty>
              <Link className={linkButton({}, 'tw:h-11 tw:self-start tw:px-6')} to="/products">Browse products</Link>
            </>
          )
        }
      </Loaded>
    </>
  )
}
