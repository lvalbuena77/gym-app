import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

export function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  // Once the login call populates `user`, send each role to its home screen.
  useEffect(() => {
    if (user) {
      navigate(user.role === "MONITOR" ? "/monitor/clients" : "/today", { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await login(username, password)
    } catch {
      setError("Usuario o contraseña incorrectos")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">Gym App</h1>

        <label className="block text-lg mb-1" htmlFor="username">
          Usuario
        </label>
        <input
          id="username"
          className="w-full h-12 rounded-lg border border-gray-300 px-3 mb-4 text-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="block text-lg mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className="w-full h-12 rounded-lg border border-gray-300 px-3 mb-6 text-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-lg bg-blue-600 text-white text-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}
