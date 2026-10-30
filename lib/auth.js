import { API_BASE } from "@/lib/api"

// NOTE: these endpoints are assumptions. Adjust the paths and payloads to
// match your Spring Boot auth controller once it exists.
async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  let data = null
  try {
    data = await res.json()
  } catch {}
  if (!res.ok) throw new Error(data?.error ?? data?.message ?? "Request failed.")
  return data
}

export const login = (email, password) => post("/auth/login", { email, password })
export const register = (name, email, password) =>
  post("/auth/register", { name, email, password })
