import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useCommerceStore } from '../../stores/commerce-store'
import { useAuthStore } from '../../stores/auth-store'

export function AppShell() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hydrateFromServer = useCommerceStore((state) => state.hydrateFromServer)
  useEffect(() => { if (isAuthenticated) void hydrateFromServer() }, [hydrateFromServer, isAuthenticated])
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
