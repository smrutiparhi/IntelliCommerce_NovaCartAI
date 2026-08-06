import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Shop',
    links: [
      { to: '/search', label: 'All Products' },
      { to: '/categories', label: 'Categories' },
      { to: '/ai-assistant', label: 'AI Assistant' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/orders', label: 'Orders' },
      { to: '/wishlist', label: 'Wishlist' },
      { to: '/settings', label: 'Settings' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/support', label: 'Help Center' },
      { to: '/support', label: 'Returns & Refunds' },
      { to: '/support', label: 'Shipping Policy' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-dark-border dark:bg-dark-surface">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="text-h4 font-semibold tracking-tight">NovaCart AI</p>
            <p className="mt-2 max-w-measure text-body-sm text-slate-500 dark:text-slate-400">
              The future of intelligent shopping.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-body-sm font-semibold text-slate-900 dark:text-slate-100">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-body-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-caption text-slate-400">© {new Date().getFullYear()} NovaCart AI. All rights reserved.</p>
      </div>
    </footer>
  )
}
