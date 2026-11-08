import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch } from "../api/client"
import type { Exercise, User, Workout, WorkoutStatus } from "../api/types"

interface ExerciseRow {
  exercise: string
  sets: string
  reps: string
  weight_kg: string
  rest_seconds: string
  note: string
}

const emptyRow: ExerciseRow = {
  exercise: "",
  sets: "4",
  reps: "10",
  weight_kg: "",
  rest_seconds: "90",
  note: "",
}

const STATUS_LABELS: Record<WorkoutStatus, string> = {
  PLANNED: "Planificado",
  DONE: "Hecho",
  PENDING: "Pendiente",
}

export function MonitorAssign() {
  const { clientId } = useParams()
  const navigate = useNavigate()

  const [client, setClient] = useState<User | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [statusValue, setStatusValue] = useState<WorkoutStatus>("PLANNED")
  const [rows, setRows] = useState<ExerciseRow[]>([{ ...emptyRow }])
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [clientsRes, workoutsRes, exercisesRes] = await Promise.all([
        apiFetch("/api/monitor/clients/"),
        apiFetch(`/api/monitor/workouts/?client=${clientId}`),
        apiFetch("/api/exercises/"),
      ])
      const clients: User[] = await clientsRes.json()
      setClient(clients.find((c) => String(c.id) === clientId) ?? null)
      setWorkouts(await workoutsRes.json())
      setExercises(await exercisesRes.json())
      setLoading(false)
    }
    load()
  }, [clientId])

  function updateRow(index: number, patch: Partial<ExerciseRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  function resetForm() {
    setEditingId(null)
    setTitle("")
    setScheduledDate("")
    setStatusValue("PLANNED")
    setRows([{ ...emptyRow }])
    setError("")
  }

  function startEdit(workout: Workout) {
    setEditingId(workout.id)
    setTitle(workout.title)
    setScheduledDate(workout.scheduled_date)
    setStatusValue(workout.status)
    setRows(
      workout.exercises.map((we) => ({
        exercise: String(we.exercise.id),
        sets: String(we.sets),
        reps: String(we.reps),
        weight_kg: we.weight_kg ?? "",
        rest_seconds: String(we.rest_seconds),
        note: we.note,
      }))
    )
    setError("")
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setSaving(true)

    const payload = {
      client: Number(clientId),
      title,
      scheduled_date: scheduledDate,
      status: statusValue,
      exercises: rows.map((row, index) => ({
        exercise: Number(row.exercise),
        order: index + 1,
        sets: Number(row.sets),
        reps: Number(row.reps),
        weight_kg: row.weight_kg || null,
        rest_seconds: Number(row.rest_seconds),
        note: row.note,
      })),
    }

    const response = editingId
      ? await apiFetch(`/api/monitor/workouts/${editingId}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await apiFetch("/api/monitor/workouts/", {
          method: "POST",
          body: JSON.stringify(payload),
        })

    if (response.ok) {
      const saved: Workout = await response.json()
      setWorkouts((prev) =>
        editingId ? prev.map((w) => (w.id === saved.id ? saved : w)) : [...prev, saved]
      )
      resetForm()
    } else {
      setError(
        editingId ? "No se pudo guardar el entreno. Revisa los datos." : "No se pudo crear el entreno. Revisa los datos."
      )
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-lg text-gray-500">
        Cargando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <button onClick={() => navigate("/monitor/clients")} className="text-blue-600">
          ← Volver a clientes
        </button>

        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold text-blue-600">
            {client ? `${client.first_name} ${client.last_name}` : "Cliente"}
          </h1>

          <h2 className="text-lg font-semibold mt-4 mb-2">Entrenos asignados</h2>
          <p className="text-gray-400 text-sm mb-2">Pulsa uno para editarlo.</p>
          {workouts.length === 0 && <p className="text-gray-500">Sin entrenos todavía.</p>}
          <ul className="space-y-2">
            {workouts
              .slice()
              .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
              .map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => startEdit(w)}
                    className={`w-full flex justify-between rounded-lg border p-3 text-left ${
                      editingId === w.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>
                      {w.scheduled_date} — {w.title}
                    </span>
                    <span className="text-sm text-gray-500">{STATUS_LABELS[w.status]}</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Editar entreno" : "Nuevo entreno"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-gray-500 underline">
                Cancelar edición
              </button>
            )}
          </div>

          <label className="block mb-1">Título</label>
          <input
            className="w-full h-12 rounded-lg border border-gray-300 px-3 mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="block mb-1">Fecha</label>
          <input
            type="date"
            className="w-full h-12 rounded-lg border border-gray-300 px-3 mb-4"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
          />

          {editingId && (
            <>
              <label className="block mb-1">Estado</label>
              <select
                className="w-full h-12 rounded-lg border border-gray-300 px-3 mb-4"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value as WorkoutStatus)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </>
          )}

          <h3 className="font-semibold mb-2">Ejercicios</h3>
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <select
                  className="w-full h-12 rounded-lg border border-gray-300 px-3"
                  value={row.exercise}
                  onChange={(e) => updateRow(index, { exercise: e.target.value })}
                  required
                >
                  <option value="">Elige un ejercicio</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Series"
                    className="h-12 rounded-lg border border-gray-300 px-3"
                    value={row.sets}
                    onChange={(e) => updateRow(index, { sets: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    className="h-12 rounded-lg border border-gray-300 px-3"
                    value={row.reps}
                    onChange={(e) => updateRow(index, { reps: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Peso (kg, opcional)"
                    className="h-12 rounded-lg border border-gray-300 px-3"
                    value={row.weight_kg}
                    onChange={(e) => updateRow(index, { weight_kg: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Descanso (s)"
                    className="h-12 rounded-lg border border-gray-300 px-3"
                    value={row.rest_seconds}
                    onChange={(e) => updateRow(index, { rest_seconds: e.target.value })}
                    required
                  />
                </div>
                <input
                  placeholder="Nota (opcional)"
                  className="w-full h-12 rounded-lg border border-gray-300 px-3"
                  value={row.note}
                  onChange={(e) => updateRow(index, { note: e.target.value })}
                />
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600 text-sm"
                  >
                    Quitar ejercicio
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 h-10 w-full rounded-lg border border-blue-600 text-blue-600"
          >
            + Añadir ejercicio
          </button>

          {error && <p className="text-red-600 mt-4">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 h-12 w-full rounded-lg bg-blue-600 text-white text-lg font-semibold disabled:opacity-50"
          >
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear entreno"}
          </button>
        </form>
      </div>
    </div>
  )
}
