const API_URL = import.meta.env.VITE_API_URL

function getAccessToken() {
  return localStorage.getItem("access_token")
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token")
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)
}

export function clearTokens() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    throw new Error("Usuario o contraseña incorrectos")
  }
  const data = await response.json()
  setTokens(data.access, data.refresh)
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false

  const response = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
  if (!response.ok) return false

  const data = await response.json()
  localStorage.setItem("access_token", data.access)
  return true
}

// Wraps fetch: attaches the access token and retries once via refresh on a 401.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const makeRequest = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })

  let response = await makeRequest()

  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      response = await makeRequest()
    } else {
      clearTokens()
    }
  }

  return response
}
