import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { get, post } from './api.js'

const AuthContext = createContext(null)

// user is undefined until GET /me answers, then the user object or null.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    get('/me').then(({ user }) => setUser(user), () => setUser(null))
  }, [])

  const value = useMemo(
    () => ({
      user,
      login: async (credentials) => setUser((await post('/login', credentials)).user),
      setUser,
      logout: async () => {
        await post('/logout')
        setUser(null)
      },
    }),
    [user],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
