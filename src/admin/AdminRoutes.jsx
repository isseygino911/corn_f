import { Navigate, Route, Routes } from 'react-router'
import { PanelShell } from '../panel/ui.jsx'
import Dashboard from './Dashboard.jsx'
import Products from './Products.jsx'
import ProductForm from './ProductForm.jsx'
import Accessories from './Accessories.jsx'
import Users from './Users.jsx'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/accessories', label: 'Accessories' },
  { to: '/admin/users', label: 'Users' },
]

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<PanelShell title="Admin" links={LINKS} />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="accessories" element={<Accessories />} />
        <Route path="users" element={<Users />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
