import { ArrowUpRight, Search, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductCardGrid } from '../components/store/ProductCardGrid'

const nearby = ['Technology', 'Fashion', 'Audio', 'Home', 'Beauty', 'Sports']

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [input, setInput] = useState(params.get('q') ?? '')
  const query = params.get('q')?.trim() ?? ''
  function submit(event: FormEvent) { event.preventDefault(); setParams(input.trim() ? { q: input.trim() } : {}) }

  return (
    <div className="min-h-screen bg-[var(--nc-bg)] py-12 text-[var(--nc-text)] lg:py-18">
      <div className="nc-shell">
        <div className="grid gap-8 border-b border-black/10 pb-12 dark:border-white/10 lg:grid-cols-[.72fr_1.28fr] lg:items-end"><div><p className="nc-label flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Global search</p><h1 className="mt-5 text-h1">Find less.<br /><span className="text-slate-600">Know more.</span></h1></div><form onSubmit={submit} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[var(--nc-surface)] px-4 shadow-card focus-within:border-violet-400/60 dark:border-white/15 dark:focus-within:border-[#dfff36]/50"><Search className="h-5 w-5 text-slate-500" /><input value={input} onChange={(event) => setInput(event.target.value)} autoFocus aria-label="Search products, brands, or categories" placeholder="Search products, brands, or categories" className="h-18 min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-600" /><button className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white dark:bg-[#dfff36] dark:text-[#101217]">Search</button></form></div>

        <section className="py-12"><ProductCardGrid query={query} />{query && <button onClick={() => { setInput(''); setParams({}) }} className="nc-secondary mt-10">Clear search</button>}</section>

        <section className="border-t border-black/10 pt-10 dark:border-white/10"><div className="flex items-center justify-between"><div><p className="nc-label">Explore something nearby</p><h2 className="mt-3 text-2xl font-semibold tracking-[-.04em]">Category directions</h2></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{nearby.map((item) => <Link key={item} to={`/search?q=${item}`} className="group flex items-center justify-between rounded-2xl border border-black/10 bg-[var(--nc-surface)] px-5 py-5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-[var(--nc-surface-raised)] hover:text-black dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"><span>{item}</span><ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-[#dfff36]" /></Link>)}</div></section>
      </div>
    </div>
  )
}
