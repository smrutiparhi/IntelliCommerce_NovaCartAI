import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './components/layout/AppShell'
import { AuthGuard } from './components/layout/AuthGuard'
import { ThemeProvider } from './components/layout/ThemeProvider'

// Pages — public
import { LandingPage } from './pages/Landing'
import { NotFoundPage } from './pages/NotFound'
import { ServerErrorPage } from './pages/ServerError'

// Auth pages (each embeds AuthLayout internally)
import { LoginPage } from './pages/auth/Login'
import { RegisterPage } from './pages/auth/Register'
import { ForgotPasswordPage } from './pages/auth/ForgotPassword'
import { ResetPasswordPage } from './pages/auth/ResetPassword'

// Protected pages — customer / all roles
import { HomePage } from './pages/Home'
import { CategoriesPage } from './pages/Categories'
import { SearchPage } from './pages/Search'
import { ProductDetailsPage } from './pages/ProductDetails'
import { WishlistPage } from './pages/Wishlist'
import { CartPage } from './pages/Cart'
import { CheckoutPage } from './pages/Checkout'
import { PaymentPage } from './pages/Payment'
import { OrdersPage } from './pages/Orders'
import { OrderTrackingPage } from './pages/OrderTracking'
import { AIAssistantPage } from './pages/AIAssistant'
import { ProfilePage } from './pages/Profile'
import { SettingsPage } from './pages/Settings'
import { SupportPage } from './pages/Support'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
})

/**
 * Thin wrapper so the auth routes share a ThemeProvider-aware background but
 * don't get the Header/Footer chrome (AppShell). Each auth page renders its
 * own AuthLayout card.
 */
function AuthRouteShell() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Outlet />
    </div>
  )
}

const router = createBrowserRouter([
  // ── Landing (public, no chrome) ──────────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ServerErrorPage />,
  },

  // ── Auth pages (shared bg, no Header/Footer) ─────────────────────────────
  {
    element: <AuthRouteShell />,
    children: [
      { path: 'login',           element: <LoginPage /> },
      { path: 'register',        element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password',  element: <ResetPasswordPage /> },
    ],
  },

  // ── App shell (Header + Footer) with auth guard ───────────────────────────
  {
    element: <AppShell />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <AuthGuard />,
        children: [
          { path: 'home',          element: <HomePage /> },
          { path: 'categories',    element: <CategoriesPage /> },
          { path: 'search',        element: <SearchPage /> },
          { path: 'products/:id',  element: <ProductDetailsPage /> },
          { path: 'wishlist',      element: <WishlistPage /> },
          { path: 'cart',          element: <CartPage /> },
          { path: 'checkout',      element: <CheckoutPage /> },
          { path: 'payment',       element: <PaymentPage /> },
          { path: 'orders',        element: <OrdersPage /> },
          { path: 'orders/:id',    element: <OrderTrackingPage /> },
          { path: 'ai-assistant',  element: <AIAssistantPage /> },
          { path: 'profile',       element: <ProfilePage /> },
          { path: 'settings',      element: <SettingsPage /> },
          { path: 'support',       element: <SupportPage /> },
        ],
      },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
])

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
