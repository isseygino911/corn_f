import { Navigate } from 'react-router'
import { useAuth } from './AuthContext.jsx'

// Renders children only for the wanted auth state; otherwise redirects (signed-out → /login, signed-in → /).
// `admin` additionally requires an admin; a signed-in non-admin goes to /.
export default function Gate({ signedIn, admin, children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (!!user !== signedIn) return <Navigate to={signedIn ? '/login' : '/'} replace />
  return admin && !user.isAdmin ? <Navigate to="/" replace /> : children
}
