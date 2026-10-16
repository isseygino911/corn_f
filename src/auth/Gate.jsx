import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthContext.jsx'

// A same-site path only ("//host" would be read as another site).
const safePath = (path) => (typeof path === 'string' && /^\/(?!\/)/.test(path) ? path : '/')

// Renders children only for the wanted auth state; otherwise redirects (signed-out → /login carrying the page to return to,
// signed-in → back to where the visitor came from, else /).
// `admin` additionally requires an admin; a signed-in non-admin goes to /.
export default function Gate({ signedIn, admin, children }) {
  const { user } = useAuth()
  const { state, pathname } = useLocation()
  if (user === undefined) return null
  if (!!user !== signedIn) {
    return signedIn ? <Navigate to="/login" state={{ from: pathname }} replace /> : <Navigate to={safePath(state?.from)} replace />
  }
  return admin && !user.isAdmin ? <Navigate to="/" replace /> : children
}
