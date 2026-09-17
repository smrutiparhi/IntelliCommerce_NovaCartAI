import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useCommerceStore } from '../../stores/commerce-store'
import { useAuthStore } from '../../stores/auth-store'

export function AppShell() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hydrateFromServer = useCommerceStore((state) => state.hydrateFromServer)
  useEffect(() => { if (isAuthenticated) void hydrateFromServer() }, [hydrateFromServer, isAuthenticated])
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="nc-route flex-1" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
