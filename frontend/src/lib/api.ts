import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
})

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
