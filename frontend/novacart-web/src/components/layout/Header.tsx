import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LogOut, Moon, Search, ShoppingCart, Sparkles, Sun, User } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuthStore } from '../../stores/auth-store'
import { logout as logoutRequest } from '../../api/auth'
import { cn } from '../../lib/utils'

const navLinks = [
  { to: '/search', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/ai-assistant', label: 'AI Assistant' },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    // Always clear local state, even if the network call fails — a user clicking
    // "logout" should never be stuck signed-in client-side over a transient error.
    onSettled: () => {
      clearAuth()
      navigate('/', { replace: true })
    },
  })

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream-surface/90 backdrop-blur dark:border-dark-border dark:bg-dark-bg/80">
      <div className="mx-auto grid h-20 max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-4 px-6">
        <Link to="/" className="flex items-center gap-2 text-h4 font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary-600" aria-hidden />
          NovaCart <span className="text-primary-600">AI</span>
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-body-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                  isActive && 'text-primary-600 dark:text-primary-400',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-dark-surface"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-dark-surface"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link
            to="/cart"
            aria-label="Cart"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-dark-surface"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex h-10 items-center gap-2 rounded-full px-3 text-body-sm font-medium text-slate-700 hover:bg-black/5 dark:text-slate-200 dark:hover:bg-dark-surface"
              >
                <User className="h-4 w-4" />
                {user?.fullName.split(' ')[0]}
              </Link>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                aria-label="Log out"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-dark-surface"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center rounded-full border border-slate-300 px-5 text-body-sm font-medium text-slate-700 hover:bg-black/5 dark:border-dark-border dark:text-slate-200 dark:hover:bg-dark-surface"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex h-10 items-center rounded-full bg-primary-600 px-5 text-body-sm font-medium text-white hover:bg-primary-700"
              >
                Start Shopping
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
