import { Navigate, Route, Routes } from 'react-router'
import { PanelShell } from '../panel/ui.jsx'
import Profile from './Profile.jsx'
import Password from './Password.jsx'
import Addresses from './Addresses.jsx'
import Orders from './Orders.jsx'

export default function AccountRoutes() {
  return (
    <Routes>
      <Route element={<PanelShell />}>
        <Route index element={<Profile />} />
        <Route path="password" element={<Password />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="orders" element={<Orders />} />
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Route>
    </Routes>
  )
}
