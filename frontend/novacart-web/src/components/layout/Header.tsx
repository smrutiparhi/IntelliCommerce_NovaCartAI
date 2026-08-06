import { Link, NavLink } from 'react-router-dom'
import { Moon, ShoppingCart, Sparkles, Sun, User } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuthStore } from '../../stores/auth-store'
import { cn } from '../../lib/utils'

const navLinks = [
  { to: '/search', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/ai-assistant', label: 'AI Assistant' },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-dark-border dark:bg-dark-bg/80">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-h4 font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary-600" aria-hidden />
          NovaCart <span className="text-primary-600">AI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
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
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-dark-surface"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-dark-surface"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex h-9 items-center gap-2 rounded-md px-2 text-body-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-dark-surface"
            >
              <User className="h-4 w-4" />
              {user?.fullName.split(' ')[0]}
            </Link>
          ) : (
            <Link to="/login">
              <span className="inline-flex h-9 items-center rounded-md bg-primary-600 px-4 text-body-sm font-medium text-white hover:bg-primary-700">
                Sign in
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
