import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Heart, LayoutGrid, LogOut, Menu, Moon, Package, Search, ShoppingBag, Sparkles, Sun, User, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout as logoutRequest } from '../../api/auth'
import { useAuthStore } from '../../stores/auth-store'
import { CartDrawer } from '../cart/CartDrawer'
import { SearchOverlay } from '../search/SearchOverlay'
import { useTheme } from '../../hooks/useTheme'
import { useCommerceStore } from '../../stores/commerce-store'
import { BrandLogo } from './BrandLogo'

const primaryNav = [
  { label: 'Discover', to: '/home' },
  { label: 'New', to: '/search?q=New' },
  { label: 'Trending', to: '/search?q=Trending' },
  { label: 'Deals', to: '/search?q=Deals' },
]

const categories = ['Technology', 'Audio', 'Fashion', 'Home', 'Appliances', 'Beauty', 'Sports', 'Books', 'Grocery', 'Toys', 'Accessories']

export function Header({ overlay = false }: { overlay?: boolean }) {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const cartCount = useCommerceStore((state) => Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0))
  const wishlistCount = useCommerceStore((state) => state.wishlist.length)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const logoutMutation = useMutation({ mutationFn: logoutRequest, onSettled: () => { clearAuth(); navigate('/', { replace: true }) } })

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) }
      if (event.key === 'Escape') { setMenuOpen(false); setShopOpen(false); setAccountOpen(false) }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  useEffect(() => { setMenuOpen(false); setShopOpen(false); setAccountOpen(false) }, [location.pathname, location.search])

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) { setMenuOpen(false); setShopOpen(false); setAccountOpen(false) }
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [])

  const active = (to: string) => {
    const [pathname, search] = to.split('?')
    if (location.pathname !== pathname) return false
    return search ? location.search.toLowerCase() === `?${search.toLowerCase()}` : !location.search
  }

  const shellClass = overlay
    ? 'fixed inset-x-0 top-0 z-60 py-3 sm:py-4'
    : 'sticky top-0 z-60 bg-[#f3f1eb]/[.85] py-3 backdrop-blur-md dark:bg-ink-950/80'

  return (
    <>
      <header ref={headerRef} className={shellClass}>
        <div className="nc-shell relative">
          <div className={`relative flex h-[60px] items-center gap-2 rounded-[1.25rem] border px-2.5 text-slate-950 transition-all duration-300 dark:text-white sm:gap-3 sm:px-3 ${scrolled || !overlay ? 'border-black/10 bg-white/[.92] shadow-[0_18px_50px_rgba(38,35,27,.10)] backdrop-blur-2xl dark:border-white/[.12] dark:bg-ink-850/[.92] dark:shadow-float' : 'border-black/10 bg-white/[.80] backdrop-blur-xl dark:border-white/10 dark:bg-black/25'}`}>
            <BrandLogo compact className="h-12 w-[108px]" />

            <nav aria-label="Primary navigation" className="ml-1 hidden items-center gap-0.5 xl:flex">
              <button type="button" onClick={() => { setShopOpen((open) => !open); setAccountOpen(false) }} aria-expanded={shopOpen} className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition ${shopOpen || location.pathname === '/categories' ? 'bg-black/[.06] text-slate-950 dark:bg-white/10 dark:text-white' : 'text-slate-600 hover:bg-black/[.04] hover:text-black dark:text-slate-400 dark:hover:bg-white/[.05] dark:hover:text-white'}`}><LayoutGrid className="h-3.5 w-3.5" /> Shop <ChevronDown className={`h-3 w-3 transition ${shopOpen ? 'rotate-180' : ''}`} /></button>
              {primaryNav.map((item) => <Link key={item.label} to={item.to} className={`relative rounded-full px-3.5 py-2 text-xs font-semibold transition ${active(item.to) ? 'bg-black/[.06] text-slate-950 dark:bg-white/10 dark:text-white' : 'text-slate-600 hover:bg-black/[.04] hover:text-black dark:text-slate-400 dark:hover:bg-white/[.05] dark:hover:text-white'}`}>{item.label}{active(item.to) && <motion.span layoutId="nav-active" className="absolute inset-x-4 -bottom-[5px] h-px bg-violet-500 dark:bg-[#dfff36]" />}</Link>)}
            </nav>

            <button type="button" onClick={() => setSearchOpen(true)} className="mx-auto hidden h-10 max-w-md flex-1 items-center gap-3 rounded-full border border-black/10 bg-black/[.025] px-4 text-left text-xs text-slate-500 transition hover:border-violet-300 hover:bg-black/[.045] md:flex dark:border-white/10 dark:bg-black/20 dark:hover:border-indigo-300/30 dark:hover:bg-white/[.055] dark:hover:text-slate-300"><Search className="h-4 w-4" /><span className="min-w-0 flex-1 truncate">Search products, brands, categories</span><kbd className="rounded-md border border-black/10 bg-black/[.035] px-2 py-1 font-sans text-[9px] text-slate-500 dark:border-white/10 dark:bg-white/[.05]">Ctrl K</kbd></button>

            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={() => setSearchOpen(true)} className="nc-icon-button md:hidden" aria-label="Open search"><Search className="h-4 w-4" /></button>
              <Link to="/ai-assistant" className="hidden h-10 items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-400/[.08] px-3 text-xs font-bold text-indigo-200 transition hover:border-indigo-300/30 hover:bg-indigo-400/[.13] dark:border-[#dfff36]/25 dark:bg-[#dfff36]/[.07] 2xl:flex"><Sparkles className="h-4 w-4" /> Nova</Link>
              {user?.roles.includes('ROLE_SELLER') && <Link to="/seller" className="hidden h-10 items-center gap-2 rounded-full border border-black/10 px-3 text-xs font-bold text-slate-700 transition hover:bg-black/[.05] dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[.06] 2xl:flex"><Package className="h-4 w-4" /> Seller</Link>}
              <Link to="/wishlist" className="nc-icon-button relative hidden sm:grid" aria-label={`Wishlist with ${wishlistCount} items`}><Heart className="h-4 w-4" />{wishlistCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white">{wishlistCount}</span>}</Link>
              <button onClick={toggleTheme} className="nc-icon-button hidden sm:grid" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
              <button onClick={() => setCartOpen(true)} className="nc-icon-button relative" aria-label={`Open cart with ${cartCount} items`}><ShoppingBag className="h-4 w-4" />{cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-violet-600 px-1 text-[8px] font-black text-white dark:bg-[#dfff36] dark:text-[#101217]">{cartCount}</span>}</button>

              {isAuthenticated ? <div className="relative hidden lg:block"><button onClick={() => { setAccountOpen((open) => !open); setShopOpen(false) }} aria-expanded={accountOpen} className="flex h-10 items-center gap-2 rounded-full border border-black/10 bg-black/[.035] pl-1.5 pr-3 text-xs font-bold text-slate-950 transition hover:bg-black/[.07] dark:border-white/10 dark:bg-white/[.045] dark:text-white dark:hover:bg-white/[.08]"><span className="grid h-7 w-7 place-items-center rounded-full bg-violet-100 text-[10px] text-violet-700 dark:bg-indigo-400/15 dark:text-indigo-200">{user?.fullName?.charAt(0).toUpperCase() ?? 'U'}</span><span className="max-w-20 truncate">{user?.fullName?.split(' ')[0]}</span><ChevronDown className={`h-3 w-3 text-slate-500 transition ${accountOpen ? 'rotate-180' : ''}`} /></button></div> : <Link to="/login" className="hidden h-10 items-center rounded-full bg-slate-950 px-5 text-xs font-bold text-white transition hover:bg-violet-700 dark:bg-white dark:text-ink-950 dark:hover:bg-indigo-100 sm:flex">Sign in</Link>}
              <button onClick={() => setMenuOpen((open) => !open)} className="nc-icon-button xl:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
            </div>
          </div>

          <AnimatePresence>
            {shopOpen && <motion.div initial={{ opacity: 0, y: -8, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .99 }} transition={{ duration: .18 }} className="absolute left-4 right-4 top-[68px] hidden overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/[.98] p-5 text-slate-950 shadow-float dark:border-white/[.12] dark:bg-ink-850/[.98] dark:text-white backdrop-blur-2xl xl:block"><div className="flex items-end justify-between border-b border-black/10 dark:border-white/10 pb-4"><div><p className="nc-label">Shop NovaCart</p><h2 className="mt-2 text-xl font-semibold tracking-[-.03em]">Explore every world.</h2></div><Link to="/categories" className="text-xs font-bold text-violet-600 hover:text-violet-500 dark:text-indigo-300 dark:hover:text-indigo-200">View all categories →</Link></div><div className="mt-4 grid grid-cols-4 gap-2">{categories.map((category, index) => <Link key={category} to={`/search?q=${category}`} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-black/[.045] hover:text-black dark:text-slate-300 dark:hover:bg-white/[.055] dark:hover:text-white"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[.05] text-[9px] font-black text-slate-500 transition group-hover:bg-indigo-400/15 group-hover:text-indigo-200">{String(index + 1).padStart(2, '0')}</span>{category}</Link>)}</div></motion.div>}

            {accountOpen && isAuthenticated && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-4 top-[68px] hidden w-56 rounded-[1.25rem] border border-black/10 bg-white/[.98] p-2 text-slate-950 shadow-float dark:border-white/[.12] dark:bg-ink-850/[.98] dark:text-white backdrop-blur-2xl lg:block"><Link to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-black/[.05] hover:text-black dark:text-slate-300 dark:hover:bg-white/[.05] dark:hover:text-white"><User className="h-4 w-4" /> Profile</Link><Link to="/orders" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-black/[.05] hover:text-black dark:text-slate-300 dark:hover:bg-white/[.05] dark:hover:text-white"><ShoppingBag className="h-4 w-4" /> Orders</Link><div className="my-1 border-t border-black/10 dark:border-white/10" /><button onClick={() => logoutMutation.mutate()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-300 hover:bg-rose-400/10"><LogOut className="h-4 w-4" /> Sign out</button></motion.div>}

            {menuOpen && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute left-4 right-4 top-[68px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/[.98] p-3 text-slate-950 shadow-float dark:border-white/[.12] dark:bg-ink-850/[.98] dark:text-white backdrop-blur-2xl xl:hidden"><nav className="grid gap-1 sm:grid-cols-2"><Link to="/categories" className="rounded-xl bg-violet-100 px-4 py-3 text-sm font-bold text-violet-700 dark:bg-indigo-400/10 dark:text-indigo-200">Shop all categories</Link>{primaryNav.map((item) => <Link key={item.label} to={item.to} className={`rounded-xl px-4 py-3 text-sm font-semibold ${active(item.to) ? 'bg-black/[.06] text-black dark:bg-white/[.07] dark:text-white' : 'text-slate-700 hover:bg-black/[.05] dark:text-slate-300 dark:hover:bg-white/[.05]'}`}>{item.label}</Link>)}<Link to="/wishlist" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-black/[.05] dark:text-slate-300 dark:hover:bg-white/[.05]">Wishlist</Link>{isAuthenticated && <><Link to="/orders" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-black/[.05] dark:text-slate-300 dark:hover:bg-white/[.05]">Orders</Link><Link to="/profile" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-black/[.05] dark:text-slate-300 dark:hover:bg-white/[.05]">Profile</Link></>}</nav><button onClick={toggleTheme} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-bold dark:border-white/10">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>{!isAuthenticated && <Link to="/login" className="nc-primary mt-3 w-full">Sign in to NovaCart</Link>}</motion.div>}
          </AnimatePresence>
        </div>
      </header>
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </>
  )
}
