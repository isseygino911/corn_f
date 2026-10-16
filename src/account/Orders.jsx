import { Link } from 'react-router'
import { Heading } from '../panel/ui.jsx'

export default function Orders() {
  return (
    <>
      <Heading>Orders</Heading>
      <p className="panel-empty">No orders yet. When you buy something, it will show up here.</p>
      <Link className="pill pill-solid" to="/products">Browse products</Link>
    </>
  )
}
