import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch } from "../api/client"
import type { Workout } from "../api/types"

export function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    apiFetch(`/api/workouts/${id}/`)
      .then((res) => res.json())
      .then(setWorkout)
      .finally(() => setLoading(false))
  }, [id])

  async function handleComplete() {
    setCompleting(true)
    const response = await apiFetch(`/api/workouts/${id}/complete/`, { method: "POST" })
    if (response.ok) {
      setWorkout(await response.json())
    }
    setCompleting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-lg text-gray-500">
        Cargando...
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-lg text-gray-500">
        Entreno no encontrado.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate("/today")} className="text-blue-600 mb-4">
          ← Volver a Hoy
        </button>

        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold text-blue-600">{workout.title}</h1>
          <p className="text-gray-500 mb-4">{workout.scheduled_date}</p>

          <div className="space-y-4">
            {workout.exercises.map((we) => (
              <div key={we.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-semibold">{we.exercise.name}</p>
                <table className="w-full text-left mt-2 text-sm text-gray-600">
                  <thead>
                    <tr>
                      <th className="pr-2">Series</th>
                      <th className="pr-2">Reps</th>
                      <th className="pr-2">Peso</th>
                      <th>Descanso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-gray-900">
                      <td className="pr-2">{we.sets}</td>
                      <td className="pr-2">{we.reps}</td>
                      <td className="pr-2">{we.weight_kg ? `${we.weight_kg} kg` : "—"}</td>
                      <td>{we.rest_seconds}s</td>
                    </tr>
                  </tbody>
                </table>
                {we.note && <p className="text-gray-500 text-sm mt-2">Nota: {we.note}</p>}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-4 text-center text-gray-400">
            Mapa muscular
          </div>

          <button
            onClick={handleComplete}
            disabled={completing || workout.status === "DONE"}
            className="mt-6 h-12 w-full rounded-lg bg-blue-600 text-white text-lg font-semibold disabled:opacity-50"
          >
            {workout.status === "DONE"
              ? "Entreno completado ✅"
              : completing
                ? "Guardando..."
                : "Marcar entreno como hecho"}
          </button>
        </div>
      </div>
    </div>
  )
}
