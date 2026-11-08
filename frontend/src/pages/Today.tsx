import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../api/client"
import type { Workout } from "../api/types"
import { useAuth } from "../auth/AuthContext"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function Today() {
  const { user, logout } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch("/api/my-workouts/")
      .then((res) => res.json())
      .then(setWorkouts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-lg text-gray-500">
        Cargando...
      </div>
    )
  }

  const today = todayIso()
  const todaysWorkout = workouts.find((w) => w.scheduled_date === today)
  const pendingWorkout = workouts.find((w) => w.status === "PENDING")
  const workout = todaysWorkout ?? pendingWorkout

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Hola, {user?.first_name}</h1>
          <button onClick={logout} className="mt-2 text-sm text-gray-500 underline">
            Cerrar sesión
          </button>
        </div>

        {!workout && (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-600">
            No tienes ningún entreno para hoy. ¡Descansa! 💪
          </div>
        )}

        {workout && (
          <div className="bg-white rounded-2xl shadow p-6">
            {!todaysWorkout && (
              <p className="text-orange-600 font-semibold mb-2">Entreno pendiente</p>
            )}
            <h2 className="text-xl font-bold">{workout.title}</h2>
            <p className="text-gray-500 mb-4">{workout.scheduled_date}</p>

            <ul className="space-y-3">
              {workout.exercises.map((we) => (
                <li
                  key={we.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <p className="font-semibold">{we.exercise.name}</p>
                  <p className="text-gray-500 text-sm">
                    {we.sets} series x {we.reps} reps
                    {we.weight_kg ? ` · ${we.weight_kg} kg` : ""}
                  </p>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate(`/workouts/${workout.id}`)}
              className="mt-6 h-12 w-full rounded-lg bg-blue-600 text-white text-lg font-semibold"
            >
              Ver entreno completo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
