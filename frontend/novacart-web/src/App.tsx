import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { AppShell } from './components/layout/AppShell'
import { AuthGuard } from './components/layout/AuthGuard'
import { ThemeProvider } from './components/layout/ThemeProvider'

// Pages — public
const LandingPage = lazy(() => import('./pages/Landing').then((module) => ({ default: module.LandingPage })))
const NotFoundPage = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFoundPage })))
const ServerErrorPage = lazy(() => import('./pages/ServerError').then((module) => ({ default: module.ServerErrorPage })))

// Auth pages (each embeds AuthLayout internally)
const LoginPage = lazy(() => import('./pages/auth/Login').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/Register').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword').then((module) => ({ default: module.ResetPasswordPage })))

// Protected pages — customer / all roles
const HomePage = lazy(() => import('./pages/Home').then((module) => ({ default: module.HomePage })))
const CategoriesPage = lazy(() => import('./pages/Categories').then((module) => ({ default: module.CategoriesPage })))
const SearchPage = lazy(() => import('./pages/Search').then((module) => ({ default: module.SearchPage })))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetails').then((module) => ({ default: module.ProductDetailsPage })))
const WishlistPage = lazy(() => import('./pages/Wishlist').then((module) => ({ default: module.WishlistPage })))
const CartPage = lazy(() => import('./pages/Cart').then((module) => ({ default: module.CartPage })))
const CheckoutPage = lazy(() => import('./pages/Checkout').then((module) => ({ default: module.CheckoutPage })))
const PaymentPage = lazy(() => import('./pages/Payment').then((module) => ({ default: module.PaymentPage })))
const OrdersPage = lazy(() => import('./pages/Orders').then((module) => ({ default: module.OrdersPage })))
const OrderTrackingPage = lazy(() => import('./pages/OrderTracking').then((module) => ({ default: module.OrderTrackingPage })))
const AIAssistantPage = lazy(() => import('./pages/AIAssistant').then((module) => ({ default: module.AIAssistantPage })))
const ProfilePage = lazy(() => import('./pages/Profile').then((module) => ({ default: module.ProfilePage })))
const SettingsPage = lazy(() => import('./pages/Settings').then((module) => ({ default: module.SettingsPage })))
const SupportPage = lazy(() => import('./pages/Support').then((module) => ({ default: module.SupportPage })))
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboard').then((module) => ({ default: module.SellerDashboardPage })))

function RouteLoader() {
  return <div className="min-h-screen bg-[var(--nc-bg)] px-5 pt-32 text-[var(--nc-text)]"><div className="mx-auto max-w-shell"><div className="h-3 w-24 animate-pulse rounded-full bg-indigo-400/20" /><div className="mt-6 h-16 max-w-xl animate-pulse rounded-2xl bg-white/[.05]" /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="aspect-[4/3] animate-pulse rounded-[2rem] border border-white/5 bg-white/[.03]" />)}</div></div></div>
}

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
          { path: 'seller',        element: <SellerDashboardPage /> },
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
        <Suspense fallback={<RouteLoader />}><RouterProvider router={router} /></Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
