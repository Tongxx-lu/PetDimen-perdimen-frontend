import axios from 'axios'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'

export const api = axios.create({
  baseURL: `${API_BASE}`,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      // clear and redirect to login
      localStorage.removeItem('token')
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export type ApiResult<T> = { code: string; message: string; data: T }


