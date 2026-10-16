import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthContext.jsx'

// Signed-out visitors go to /login, carrying the page to come back to (the cart is kept in localStorage).
export default function RequireUser({ children }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (user === undefined) return null
  return user ? children : <Navigate to="/login" state={{ from: pathname }} replace />
}
