import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/auth-store'
import type { ApiError, ApiResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true, // sends the httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function silentRefresh(): Promise<string | null> {
  try {
    const response = await axios.post<ApiResponse<{ accessToken: string; user: { id: string; email: string; fullName: string; roles: string[] } }>>(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {},
      { withCredentials: true },
    )
    if (response.data.success) {
      const { accessToken, user } = response.data.data
      useAuthStore.getState().setAuth(user as never, accessToken)
      return accessToken
    }
    return null
  } catch {
    useAuthStore.getState().clearAuth()
    return null
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true
      refreshPromise ??= silentRefresh().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      }
    }

    return Promise.reject(error)
  },
)

export async function bootstrapAuth(): Promise<void> {
  await silentRefresh()
  useAuthStore.getState().setBootstrapped()
}

export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error) && error.response?.data?.success === false
}
