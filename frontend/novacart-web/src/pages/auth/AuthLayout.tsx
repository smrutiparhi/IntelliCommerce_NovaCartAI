import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-h4 font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary-600" aria-hidden />
          NovaCart <span className="text-primary-600">AI</span>
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-md dark:border-dark-border dark:bg-dark-surface">
          <h1 className="text-h3 font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-body-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
