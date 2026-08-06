import { create } from 'zustand'
import type { User } from '../types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  setBootstrapped: () => void
}

/**
 * Access token lives in memory only — never localStorage/sessionStorage, so an XSS
 * payload can't exfiltrate it. The refresh token is an httpOnly cookie the backend
 * sets on login; this store never sees it. On app boot, a silent refresh call
 * (relying on that cookie) rehydrates the access token — see api-client.ts.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapping: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
  setBootstrapped: () => set({ isBootstrapping: false }),
}))
