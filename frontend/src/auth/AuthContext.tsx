import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiFetch, clearTokens, login as apiLogin } from "../api/client"
import type { User } from "../api/types"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadUser() {
    const response = await apiFetch("/api/me/")
    setUser(response.ok ? await response.json() : null)
  }

  useEffect(() => {
    loadUser().finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    await apiLogin(username, password)
    await loadUser()
  }

  function logout() {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
