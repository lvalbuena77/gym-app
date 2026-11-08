import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../api/client"
import type { User } from "../api/types"
import { useAuth } from "../auth/AuthContext"

export function MonitorClients() {
  const { user, logout } = useAuth()
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch("/api/monitor/clients/")
      .then((res) => res.json())
      .then(setClients)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Hola, {user?.first_name}</h1>
          <button onClick={logout} className="mt-2 text-sm text-gray-500 underline">
            Cerrar sesión
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Mis clientes</h2>
          {loading && <p className="text-gray-500">Cargando...</p>}
          {!loading && clients.length === 0 && (
            <p className="text-gray-500">Todavía no tienes clientes asignados.</p>
          )}
          <ul className="space-y-3">
            {clients.map((client) => (
              <li key={client.id}>
                <button
                  onClick={() => navigate(`/monitor/clients/${client.id}`)}
                  className="w-full h-14 rounded-lg border border-gray-200 px-4 text-left text-lg hover:bg-gray-50"
                >
                  {client.first_name} {client.last_name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
