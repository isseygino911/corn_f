import { Link } from 'react-router'
import { useAuth } from './AuthContext.jsx'
import SignOutButton from './SignOutButton.jsx'

// Sign in pill, or the user's name (linking to their panel: /admin for admins, else /account) with Sign out. Rendered in the bar and in the mobile menu.
export default function NavAuth({ onNavigate }) {
  const { user } = useAuth()
  if (user === undefined) return null
  return (
    <div className="nav-auth">
      {user ? (
        <>
          <Link className="nav-user" to={user.isAdmin ? '/admin' : '/account'} onClick={onNavigate}>{user.name}</Link>
          <SignOutButton className="pill" onNavigate={onNavigate} />
        </>
      ) : (
        <Link className="pill" to="/login" onClick={onNavigate}>Sign in</Link>
      )}
    </div>
  )
}
