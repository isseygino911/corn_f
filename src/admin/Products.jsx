import { Link } from 'react-router'
import { Thumb, linkButton } from '../panel/ui.jsx'
import Catalog, { Status, priceCell } from './Catalog.jsx'

const mainImage = (p) => p.images?.find((i) => i.isMain)?.url

const COLUMNS = [
  { label: 'Image', cell: (p) => <Thumb url={mainImage(p)} /> },
  { label: 'SKU', cell: (p) => p.sku },
  { label: 'Name', cell: (p) => p.name },
  { label: 'Collection', cell: (p) => p.collection },
  { label: 'Price', cell: priceCell },
  { label: 'Stock', cell: (p) => p.stock },
  { label: 'Status', cell: (p) => <Status row={p} /> },
]

export default function Products() {
  return (
    <Catalog
      title="Products"
      endpoint="/admin/products"
      listKey="products"
      columns={COLUMNS}
      action={<Link className={linkButton()} to="/admin/products/new">New product</Link>}
      edit={(p) => <Link className={linkButton({ variant: 'outline', size: 'sm' })} to={`/admin/products/${p.id}`}>Edit</Link>}
    />
  )
}
