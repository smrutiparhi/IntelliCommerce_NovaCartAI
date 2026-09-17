import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, Heart, LayoutGrid, LogOut, Menu, Moon, Package, Search, Settings, ShoppingBag, Sun, User, X } from 'lucide-react'
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
import { useCatalogue } from '../../hooks/useCatalogue'

const navigation = [
  { label: 'Discover', to: '/home' },
  { label: 'New in', to: '/search?q=New' },
  { label: 'Best sellers', to: '/search?q=Trending' },
  { label: 'The sale edit', to: '/search?q=Deals' },
]
const categories = ['Technology', 'Audio', 'Fashion', 'Home', 'Appliances', 'Beauty', 'Sports', 'Books', 'Grocery', 'Toys', 'Accessories']
const menuMotion = { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: { duration: .18 } }

export function Header(_props: { overlay?: boolean }) {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const cartCount = useCommerceStore((state) => Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0))
  const wishlistCount = useCommerceStore((state) => state.wishlist.length)
  const { data: catalogue } = useCatalogue()
  const pruneUnknownProducts = useCommerceStore((state) => state.pruneUnknownProducts)
  const cart = useCommerceStore((state) => state.cart)
  useEffect(() => {
    if (catalogue?.source === 'api') pruneUnknownProducts(catalogue.products.map((product) => product.id))
  }, [catalogue, cart, pruneUnknownProducts])
  const [menu, setMenu] = useState<'shop' | 'account' | 'mobile' | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const logoutMutation = useMutation({ mutationFn: logoutRequest, onSettled: () => { clearAuth(); navigate('/', { replace: true }) } })
  const toggleMenu = (next: 'shop' | 'account' | 'mobile') => setMenu((current) => current === next ? null : next)
  const seller = user?.roles.some((role) => role === 'ROLE_SELLER' || role === 'ROLE_ADMIN')

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 15)
    scroll()
    window.addEventListener('scroll', scroll, { passive: true })
    return () => window.removeEventListener('scroll', scroll)
  }, [])
  useEffect(() => { setMenu(null); setSearchOpen(false); setCartOpen(false) }, [location.pathname, location.search])
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen((open) => !open) }
      if (event.key === 'Escape') setMenu(null)
    }
    const outside = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setMenu(null) }
    document.addEventListener('keydown', key)
    document.addEventListener('pointerdown', outside)
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside) }
  }, [])

  return <>
    <a href="#main-content" className="nc-skip">Skip to content</a>
    <header ref={headerRef} className={`nc-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nc-shell nc-header-main">
        <BrandLogo compact />
        <nav className="nc-nav" aria-label="Primary navigation">
          <button onClick={() => toggleMenu('shop')} aria-expanded={menu === 'shop'} aria-controls="shop-menu" className={menu === 'shop' ? 'is-active' : ''}>Shop <ChevronDown /></button>
          {navigation.map(({ label, to }) => <Link key={to} to={to} className={location.pathname + location.search === to ? 'is-active' : ''}>{label}</Link>)}
        </nav>
        <button onClick={() => setSearchOpen(true)} className="nc-nav-search" aria-label="Search products"><Search size={15} /><span>Find your next favourite</span><kbd>Ctrl K</kbd></button>
        <div className="nc-header-actions">
          <button onClick={() => setSearchOpen(true)} className="nc-icon-button nc-mobile-search" aria-label="Open search"><Search size={17} /></button>
          <button onClick={toggleTheme} className="nc-icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
          <Link to="/wishlist" className="nc-icon-button nc-header-wishlist relative" aria-label={`Wishlist with ${wishlistCount} items`}><Heart size={17} />{wishlistCount > 0 && <span className="nc-count">{wishlistCount}</span>}</Link>
          <button onClick={() => setCartOpen(true)} className="nc-icon-button nc-bag" aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={17} />{cartCount > 0 && <span className="nc-count">{cartCount}</span>}</button>
          {isAuthenticated
            ? <button onClick={() => toggleMenu('account')} aria-expanded={menu === 'account'} aria-controls="account-menu" className="nc-account-button" aria-label="Account menu"><span className="nc-avatar">{user?.fullName?.charAt(0).toUpperCase() || 'U'}</span><span className="nc-account-name">{user?.fullName?.split(' ')[0]}</span><ChevronDown size={12} /></button>
            : <Link to="/login" className="nc-account-button">Sign in <ArrowUpRight size={13} /></Link>}
          <button onClick={() => toggleMenu('mobile')} className="nc-icon-button nc-menu-toggle" aria-label="Toggle navigation" aria-expanded={menu === 'mobile'} aria-controls="mobile-menu">{menu === 'mobile' ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        <AnimatePresence>
          {menu === 'shop' && <motion.div {...menuMotion} id="shop-menu" className="nc-menu-popover nc-megamenu">
            <div className="flex items-end justify-between gap-4"><div><p className="nc-label">A little of everything. All considered.</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Find your kind of everyday.</h2></div><Link to="/categories" className="nc-text-link">All categories <ArrowUpRight size={15} /></Link></div>
            <div className="nc-mega-links">{categories.map((category, index) => <Link key={category} to={`/search?q=${category}`}><span>{String(index + 1).padStart(2, '0')}</span>{category}</Link>)}</div>
          </motion.div>}
          {menu === 'account' && isAuthenticated && <motion.div {...menuMotion} id="account-menu" className="nc-menu-popover nc-account-menu">
            <div className="px-3 py-3 mb-1 border-b"><p className="text-sm font-semibold">{user?.fullName}</p><p className="nc-muted mt-1 text-[10px] truncate">{user?.email}</p></div>
            <Link to="/profile"><User /> My profile</Link><Link to="/orders"><Package /> My orders</Link><Link to="/settings"><Settings /> Account settings</Link>
            {seller && <Link to="/seller"><LayoutGrid /> Seller studio</Link>}
            <button onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}><LogOut /> Sign out</button>
          </motion.div>}
          {menu === 'mobile' && <motion.nav {...menuMotion} id="mobile-menu" aria-label="Mobile navigation" className="nc-menu-popover nc-mobile-menu">
            <p className="nc-label px-3 py-2">Your world, thoughtfully selected</p>
            <Link to="/categories">Shop all categories</Link>{navigation.map(({ label, to }) => <Link key={to} to={to}>{label}</Link>)}
            <Link to="/wishlist">Wishlist</Link><Link to="/ai-assistant">Meet Nova AI</Link>
            {isAuthenticated ? <><Link to="/orders">My orders</Link><Link to="/profile">My profile</Link><Link to="/settings">Account settings</Link>{seller && <Link to="/seller">Seller studio</Link>}<button onClick={() => logoutMutation.mutate()} className="nc-secondary">Sign out</button></> : <Link to="/login" className="nc-primary">Sign in</Link>}
          </motion.nav>}
        </AnimatePresence>
      </div>
    </header>
    <SearchOverlay open={searchOpen} onClose={closeSearch} />
    <CartDrawer open={cartOpen} onClose={closeCart} />
  </>
}
