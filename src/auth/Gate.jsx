import { Navigate } from 'react-router'
import { useAuth } from './AuthContext.jsx'

// Renders children only for the wanted auth state; otherwise redirects (signed-out → /login, signed-in → /).
export default function Gate({ signedIn, children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  return !!user === signedIn ? children : <Navigate to={signedIn ? '/login' : '/'} replace />
}
