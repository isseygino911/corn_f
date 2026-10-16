import { Navigate, Route, Routes } from 'react-router'
import { PanelShell } from '../panel/ui.jsx'
import Dashboard from './Dashboard.jsx'
import Products from './Products.jsx'
import ProductForm from './ProductForm.jsx'
import Accessories from './Accessories.jsx'
import Users from './Users.jsx'
import { OrderPage, OrdersList } from './Orders.jsx'
import Settings from './Settings.jsx'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<PanelShell />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="accessories" element={<Accessories />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:id" element={<OrderPage />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
