import { ArrowLeft, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../../components/layout/BrandLogo'
import { useTheme } from '../../hooks/useTheme'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  return <main className="nc-auth" id="main-content">
    <aside className="nc-auth-visual">
      <BrandLogo imageClassName="!brightness-0 !invert" />
      <h2>Good things<br />start with<br /><em>a little curiosity.</em></h2>
      <p>Your favourite finds, saved places, and next great discovery. All here, all yours.</p>
      <img className="nc-auth-photo" src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1100&q=85" alt="A thoughtfully furnished home" />
      <p className="!mt-auto !pt-8 !z-10">Smart shopping. Better living.</p>
    </aside>
    <section className="nc-auth-form">
      <div><div className="mb-10 flex items-center justify-between"><Link to="/" className="nc-text-link nc-muted"><ArrowLeft size={14} /> Back to the good things</Link><button onClick={toggleTheme} className="nc-icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button></div>
        <BrandLogo compact className="mb-8 lg:hidden" />
        <p className="nc-label">Your NovaCart</p>
        <h1 className="mt-4 font-semibold">{title}</h1>
        <p className="nc-muted mt-3 text-sm leading-6">{subtitle}</p>
        <div className="mt-7">{children}</div>
        <p className="nc-muted mt-8 text-[10px] leading-5">By continuing, you agree to our <Link to="/support" className="underline underline-offset-4">Terms</Link> and <Link to="/settings" className="underline underline-offset-4">Privacy Policy</Link>.</p>
      </div>
    </section>
  </main>
}
