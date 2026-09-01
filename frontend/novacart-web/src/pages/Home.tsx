import { ArrowRight, ArrowUpRight, PackageOpen, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AIShoppingPanel } from '../components/ai/AIShoppingPanel'
import { ProductCardGrid } from '../components/store/ProductCardGrid'
import { useAIStore } from '../stores/ai-store'
import { DepthCard, Reveal } from '../components/motion/DepthCard'
import { PRODUCTS } from '../data/store-products'

const edits = [
  { title: 'Technology', copy: 'Objects that make complexity disappear.', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1100&q=85' },
  { title: 'Personal audio', copy: 'Private spaces, beautifully engineered.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=85' },
  { title: 'Living', copy: 'A calmer point of view for home.', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1100&q=85' },
]

export function HomePage() {
  const { isPanelOpen } = useAIStore()
  return (
    <div className="min-h-screen bg-[var(--nc-bg)] text-[var(--nc-text)]">
      <div className="nc-shell pb-24 pt-6">
        <Reveal><section className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#101217] text-white lg:grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative z-10 flex flex-col justify-end px-7 py-12 sm:px-12 lg:px-16 lg:py-16"><p className="nc-label flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Your NovaCart</p><h1 className="mt-5 max-w-3xl text-h1">Better finds.<br /><span className="text-slate-500">Less searching.</span></h1><p className="mt-6 max-w-xl text-sm leading-7 text-slate-400">A curated marketplace spanning technology, style, home, wellness, food, books, and play—ready to explore right now.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/categories" className="nc-primary">Explore categories <ArrowRight className="h-4 w-4" /></Link><span className="nc-secondary cursor-default !border-white/15 !bg-white/[.04] !text-white"><PackageOpen className="h-4 w-4 text-indigo-300" /> {PRODUCTS.length} products listed</span></div></div>
          <div className="relative min-h-[360px] overflow-hidden border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0"><img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1200&q=88" alt="Audio category visual preview" className="h-full w-full object-cover opacity-65" /><div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-transparent to-indigo-500/10 lg:bg-gradient-to-r" /><div className="absolute bottom-7 left-7 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md"><p className="nc-label">Category preview</p><p className="mt-1 text-sm font-semibold">Shop personal audio</p></div></div>
        </section></Reveal>

        <section className="py-22"><Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="nc-label">Editorial lens</p><h2 className="mt-4 text-h2">Explore by intention.</h2></div><Link to="/categories" className="text-sm font-semibold text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white">All categories →</Link></Reveal><div className="mt-10 grid gap-4 lg:grid-cols-3">{edits.map((edit, index) => <Reveal key={edit.title} delay={index * .07}><DepthCard intensity={4} className="rounded-[2rem]"><Link to={`/search?q=${edit.title}`} className="nc-depth-surface group relative block aspect-[4/4.6] text-white overflow-hidden rounded-[2rem] border border-white/10 bg-ink-850"><img src={edit.image} alt={`${edit.title} category preview`} loading="lazy" className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-[1.055] group-hover:opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" /><div className="nc-depth-layer absolute inset-x-6 bottom-6"><div className="flex items-end justify-between"><div><p className="text-xs text-indigo-300">Curated collection</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">{edit.title}</h3><p className="mt-2 max-w-xs text-sm text-slate-400">{edit.copy}</p></div><ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" /></div></div></Link></DepthCard></Reveal>)}</div></section>

        <section className="border-t border-white/10 pt-16"><div className={`grid gap-6 ${isPanelOpen ? 'lg:grid-cols-[minmax(0,1fr)_390px]' : ''}`}><div><ProductCardGrid /></div>{isPanelOpen && <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] lg:block"><AIShoppingPanel /></aside>}</div></section>
      </div>
      <Link to="/ai-assistant" className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-float lg:hidden"><Sparkles className="h-4 w-4" /> Ask Nova</Link>
    </div>
  )
}
