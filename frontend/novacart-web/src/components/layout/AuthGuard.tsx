import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth-store'
import type { Role } from '../../types/user'

interface AuthGuardProps {
  requiredRole?: Role
}

/** Client-side gate for UX only — every service re-verifies the JWT server-side
 * regardless (defense in depth, see ARCHITECTURE.md §8). This guard just avoids
 * flashing protected UI before redirecting. */
export function AuthGuard({ requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isBootstrapping, user } = useAuthStore()
  const location = useLocation()

  if (isBootstrapping) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && !user?.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
