import { apiClient } from '../lib/api-client'
import type { ApiSuccess } from '../types/api'
import type { User } from '../types/user'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  role: 'ROLE_CUSTOMER' | 'ROLE_SELLER'
}

interface AuthResult {
  user: User
  accessToken: string
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/login', payload)
  return data.data
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/register', payload)
  return data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword })
}
