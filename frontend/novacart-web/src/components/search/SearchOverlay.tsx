import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Command, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRODUCTS } from '../../data/store-products'

const suggestions = ['Technology', 'Fashion', 'Home', 'Beauty', 'Sports', 'Appliances', 'Books', 'Grocery']

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', handleKey); document.body.style.overflow = previousOverflow }
  }, [open, onClose])

  function search(value: string) {
    const clean = value.trim()
    onClose()
    navigate(clean ? `/search?q=${encodeURIComponent(clean)}` : '/search')
  }

  function submit(event: FormEvent) { event.preventDefault(); search(query) }

  return (
    <AnimatePresence>
      {open && <motion.div className="fixed inset-0 z-80 flex items-start justify-center bg-black/55 px-3 pt-3 backdrop-blur-xl sm:px-6 sm:pt-[8vh] dark:bg-black/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
        <motion.section role="dialog" aria-modal="true" aria-labelledby="search-title" initial={{ opacity: 0, y: -16, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .99 }} transition={{ duration: .22 }} className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-black/10 bg-[var(--nc-surface)] text-[var(--nc-text)] shadow-[0_30px_100px_rgba(20,18,14,.22)] dark:border-white/15 dark:shadow-float">
          <div className="flex items-center gap-3 border-b border-black/10 px-4 dark:border-white/10 sm:px-6"><Search className="h-5 w-5 text-slate-500" /><form onSubmit={submit} className="flex min-w-0 flex-1"><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search NovaCart" placeholder="Search products, brands, or categories" className="h-20 w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-600 sm:text-lg" /></form><span className="hidden items-center gap-1 rounded-lg border border-black/10 bg-black/[.035] px-2 py-1 text-[10px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 sm:flex"><Command className="h-3 w-3" /> K</span><button onClick={onClose} className="nc-icon-button" aria-label="Close search"><X className="h-4 w-4" /></button></div>
          <div className="grid gap-8 p-5 sm:p-7 md:grid-cols-[1fr_.72fr]">
            <div><p id="search-title" className="nc-label">Explore categories</p><div className="mt-4 space-y-1">{suggestions.map((item) => <button key={item} onClick={() => search(item)} className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-black/[.045] hover:text-black dark:text-slate-300 dark:hover:bg-white/[.05] dark:hover:text-white"><span>{item}</span><ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-[#dfff36]" /></button>)}</div></div>
            <div className="rounded-2xl border border-violet-300/40 bg-violet-100/60 p-5 dark:border-[#dfff36]/20 dark:bg-[#dfff36]/[.06]"><Sparkles className="h-5 w-5 text-violet-600 dark:text-[#dfff36]" /><p className="mt-5 text-lg font-semibold tracking-tight">The catalogue is ready.</p><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Search {PRODUCTS.length} products across eleven curated shopping categories.</p><button onClick={() => { onClose(); navigate('/ai-assistant') }} className="mt-5 text-xs font-bold text-violet-700 hover:text-violet-500 dark:text-[#dfff36]">Ask Nova instead →</button></div>
          </div>
          <div className="flex items-center justify-between border-t border-black/10 px-5 py-3 text-[10px] text-slate-500 dark:border-white/10 dark:text-slate-600 sm:px-7"><span>Press Enter to search</span><span>Esc to close</span></div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  )
}
