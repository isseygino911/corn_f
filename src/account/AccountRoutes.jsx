import { Navigate, Route, Routes } from 'react-router'
import { PanelShell } from '../panel/ui.jsx'
import Profile from './Profile.jsx'
import Password from './Password.jsx'
import Addresses from './Addresses.jsx'
import Orders from './Orders.jsx'

const LINKS = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/password', label: 'Password' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/orders', label: 'Orders' },
]

export default function AccountRoutes() {
  return (
    <Routes>
      <Route element={<PanelShell title="Account" links={LINKS} />}>
        <Route index element={<Profile />} />
        <Route path="password" element={<Password />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="orders" element={<Orders />} />
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Route>
    </Routes>
  )
}
