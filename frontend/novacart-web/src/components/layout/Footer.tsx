import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'

const columns = [
  { title: 'Explore', links: [['/home', 'Discover'], ['/categories', 'Categories'], ['/search', 'Search'], ['/ai-assistant', 'Nova AI']] },
  { title: 'Account', links: [['/orders', 'Orders'], ['/wishlist', 'Wishlist'], ['/cart', 'Cart'], ['/profile', 'Profile']] },
  { title: 'Company', links: [['/support', 'Support'], ['/support', 'Shipping'], ['/support', 'Returns'], ['/settings', 'Privacy']] },
]

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[var(--nc-bg)] text-[var(--nc-text)] dark:border-white/10">
      <div className="nc-shell py-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <BrandLogo />
            <h2 className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">Shopping with better context.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">A curated marketplace for considered choices across everyday life.</p>
          </div>
          <div className="grid grid-cols-2 gap-9 sm:grid-cols-3">
            {columns.map((column) => <div key={column.title}><p className="nc-label">{column.title}</p><ul className="mt-5 space-y-3">{column.links.map(([to, label]) => <li key={label}><Link to={to} className="group inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-black dark:hover:text-white">{label}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>)}</ul></div>)}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-black/10 pt-6 text-[11px] text-slate-600 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NovaCart AI. All rights reserved.</p>
          <p>Smart shopping. Better living.</p>
        </div>
      </div>
    </footer>
  )
}
