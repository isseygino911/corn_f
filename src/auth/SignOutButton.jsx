import { useAuth } from './AuthContext.jsx'
import { useAction } from './useAction.js'

// Signs out; onNavigate lets the mobile menu close itself first.
export default function SignOutButton({ className, onNavigate }) {
  const { logout } = useAuth()
  const { run, pending } = useAction(logout)
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        onNavigate?.()
        run()
      }}
    >
      Sign out
    </button>
  )
}
