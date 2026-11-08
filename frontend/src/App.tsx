import { Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { ExerciseDetail } from "./pages/ExerciseDetail"
import { Login } from "./pages/Login"
import { MonitorAssign } from "./pages/MonitorAssign"
import { MonitorClients } from "./pages/MonitorClients"
import { Today } from "./pages/Today"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/today"
        element={
          <ProtectedRoute allowedRoles={["CLIENT"]}>
            <Today />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts/:id"
        element={
          <ProtectedRoute allowedRoles={["CLIENT"]}>
            <ExerciseDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitor/clients"
        element={
          <ProtectedRoute allowedRoles={["MONITOR"]}>
            <MonitorClients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitor/clients/:clientId"
        element={
          <ProtectedRoute allowedRoles={["MONITOR"]}>
            <MonitorAssign />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
