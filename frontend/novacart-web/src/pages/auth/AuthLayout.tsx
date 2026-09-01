import { BadgeCheck, LockKeyhole, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../../components/layout/BrandLogo'

const assurances = [
  { icon: LockKeyhole, text: 'Encrypted account and session protection' },
  { icon: BadgeCheck, text: 'Clear identity and role-based access' },
  { icon: Sparkles, text: 'A storefront ready for real catalogue data' },
]

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-[var(--nc-bg)] text-[var(--nc-text)] lg:grid-cols-[.92fr_1.08fr]">
      <section className="relative flex items-center justify-center overflow-hidden px-5 py-10 sm:px-10 lg:px-14">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-violet-500/10 blur-[120px] dark:bg-[#dfff36]/[.06]" />
        <div className="relative w-full max-w-[470px]">
          <BrandLogo className="mb-9" />
          <div className="rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-6 shadow-[0_24px_80px_rgba(40,36,28,.10)] dark:border-white/10 dark:shadow-float sm:p-9">
            <p className="nc-label flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Secure access</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
          <p className="mt-6 text-center text-[11px] text-slate-600">By continuing, you agree to our <Link to="/support" className="underline hover:text-slate-950 dark:hover:text-white">Terms</Link> and <Link to="/settings" className="underline hover:text-slate-950 dark:hover:text-white">Privacy Policy</Link>.</p>
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden border-l border-black/10 bg-[#111317] p-12 text-white lg:flex lg:flex-col lg:justify-between dark:border-white/10 dark:bg-[#0a0c11] xl:p-16">
        <div className="absolute inset-0 nc-grid opacity-25" />
        <div className="absolute -right-24 top-[20%] h-96 w-96 rounded-full bg-violet-500/15 blur-[140px] dark:bg-[#dfff36]/10" />
        <p className="relative nc-label">NovaCart / Identity</p>
        <div className="relative max-w-xl">
          <h2 className="text-5xl font-semibold leading-[.94] tracking-[-.06em] xl:text-7xl">Good choices begin with <span className="text-violet-300 dark:text-[#dfff36]">better context.</span></h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400">A quieter, more intentional commerce experience—built on real identity, real data, and thoughtful interaction.</p>
          <div className="mt-10 space-y-3">{assurances.map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3 text-sm text-slate-300"><span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.04]"><Icon className="h-4 w-4 text-violet-300 dark:text-[#dfff36]" /></span>{text}</div>)}</div>
        </div>
        <p className="relative text-[11px] text-slate-600">© {new Date().getFullYear()} NovaCart AI</p>
      </aside>
    </main>
  )
}
