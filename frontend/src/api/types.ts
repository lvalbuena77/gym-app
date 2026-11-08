export type Role = "ADMIN" | "MONITOR" | "CLIENT"

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: Role
}

export interface Exercise {
  id: number
  name: string
  description: string
  primary_muscles: string[]
  secondary_muscles: string[]
}

export interface WorkoutExercise {
  id: number
  exercise: Exercise
  order: number
  sets: number
  reps: number
  weight_kg: string | null
  rest_seconds: number
  note: string
}

export type WorkoutStatus = "PLANNED" | "DONE" | "PENDING"

export interface Workout {
  id: number
  client: number
  client_name: string
  monitor: number
  monitor_name: string
  title: string
  scheduled_date: string
  status: WorkoutStatus
  exercises: WorkoutExercise[]
}
