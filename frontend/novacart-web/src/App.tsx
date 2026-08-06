import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryClient } from './lib/query-client'
import { bootstrapAuth } from './lib/api-client'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { AppShell } from './components/layout/AppShell'
import { AuthGuard } from './components/layout/AuthGuard'

import { LandingPage } from './pages/Landing'
import { HomePage } from './pages/Home'
import { CategoriesPage } from './pages/Categories'
import { ProductDetailsPage } from './pages/ProductDetails'
import { SearchPage } from './pages/Search'
import { WishlistPage } from './pages/Wishlist'
import { CartPage } from './pages/Cart'
import { CheckoutPage } from './pages/Checkout'
import { PaymentPage } from './pages/Payment'
import { OrdersPage } from './pages/Orders'
import { OrderTrackingPage } from './pages/OrderTracking'
import { ProfilePage } from './pages/Profile'
import { SettingsPage } from './pages/Settings'
import { AIAssistantPage } from './pages/AIAssistant'
import { SupportPage } from './pages/Support'
import { AdminDashboardPage } from './pages/admin/AdminDashboard'
import { AnalyticsDashboardPage } from './pages/admin/AnalyticsDashboard'
import { SellerDashboardPage } from './pages/seller/SellerDashboard'
import { LoginPage } from './pages/auth/Login'
import { RegisterPage } from './pages/auth/Register'
import { ForgotPasswordPage } from './pages/auth/ForgotPassword'
import { ResetPasswordPage } from './pages/auth/ResetPassword'
import { NotFoundPage } from './pages/NotFound'
import { ServerErrorPage } from './pages/ServerError'

function App() {
  useEffect(() => {
    void bootstrapAuth()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone — no header/footer chrome */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route element={<AppShell />}>
              <Route index element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/products/:slug" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/support" element={<SupportPage />} />

              {/* Requires authentication */}
              <Route element={<AuthGuard />}>
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderTrackingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Requires ROLE_SELLER */}
              <Route element={<AuthGuard requiredRole="ROLE_SELLER" />}>
                <Route path="/seller" element={<SellerDashboardPage />} />
              </Route>

              {/* Requires ROLE_ADMIN */}
              <Route element={<AuthGuard requiredRole="ROLE_ADMIN" />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />
              </Route>

              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
