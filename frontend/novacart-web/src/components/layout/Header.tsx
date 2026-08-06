import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Sparkles, User, ChevronDown, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../../stores/auth-store'
import { useAIStore } from '../../stores/ai-store'
import { useTheme } from '../../hooks/useTheme'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user } = useAuthStore()
  const { searchQuery, setSearchQuery } = useAIStore()
  const navigate = useNavigate()
  const [localSearch, setLocalSearch] = useState(searchQuery)

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!localSearch.trim()) return
    setSearchQuery(localSearch.trim())
    navigate('/home')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-h4 font-extrabold tracking-tight text-slate-900 dark:text-white shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-purple-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>NovaCart <span className="text-primary-600">AI</span></span>
        </Link>

        {/* Top AI Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl items-center">
          <div className="flex w-full items-center rounded-full border border-slate-200 bg-slate-50/80 p-1 shadow-inner dark:border-dark-border dark:bg-dark-surface focus-within:ring-2 focus-within:ring-primary-500/20">
            {/* Category Pill Tag */}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-dark-bg dark:text-slate-300 ml-1">
              <span>All</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>

            <Sparkles className="ml-2.5 h-4 w-4 shrink-0 text-primary-500" />
            
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search or ask AI..."
              className="w-full bg-transparent px-3 text-body-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />

            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200 transition-colors shadow-sm"
          >
            {theme === 'light' ? <Moon className="h-4 w-4 text-slate-600" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-body-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200 transition-colors shadow-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="ml-1 rounded-full bg-primary-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
              2
            </span>
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-body-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200 transition-colors shadow-sm"
            >
              <User className="h-4 w-4" />
              <span>{user?.fullName.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-1.5 text-body-sm font-semibold text-white hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors shadow-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
