import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DepthCard, Reveal } from '../components/motion/DepthCard'
import { Header } from '../components/layout/Header'
import { BrandLogo } from '../components/layout/BrandLogo'
import { PRODUCTS } from '../data/store-products'

const categories = [
  { name: 'Technology', note: 'Future essentials', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=85', className: 'md:col-span-2 md:row-span-2' },
  { name: 'Audio', note: 'Hear more', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85', className: '' },
  { name: 'Fashion', note: 'New perspective', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=85', className: '' },
  { name: 'Home', note: 'Quietly refined', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85', className: 'md:col-span-2' },
]

const featuredProduct = PRODUCTS.find((product) => product.id === 'stride-flow-runner') ?? PRODUCTS[0]

export function LandingPage() {
  const reduceMotion = useReducedMotion()

  return (
    <main className="min-h-screen bg-[var(--nc-bg)] text-[var(--nc-text)]">
      <Header overlay />

      <section className="flex min-h-screen items-center bg-[#f3f1eb] px-0 pb-14 pt-36 text-[#101217] dark:hidden sm:pt-40">
        <div className="nc-shell">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }} className="grid min-h-[650px] overflow-hidden rounded-[2.4rem] border border-black/10 bg-[#101217] shadow-[0_34px_100px_rgba(36,31,20,.16)] lg:grid-cols-[1.02fr_.98fr]">
            <div className="relative flex flex-col justify-center overflow-hidden px-7 py-14 text-white sm:px-12 lg:px-16 lg:py-18">
              <div className="absolute inset-0 nc-grid opacity-30" />
              <div className="absolute -left-36 top-24 h-80 w-80 rounded-full bg-[#dfff36]/10 blur-[100px]" />
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#dfff36]/30 bg-[#dfff36]/[.08] px-3 py-2 text-[10px] font-black uppercase tracking-[.2em] text-[#dfff36]"><Sparkles className="h-3.5 w-3.5" /> Shopping, reimagined</p>
                <h1 className="mt-8 max-w-xl text-[clamp(3.6rem,6vw,6.8rem)] font-bold leading-[.88] tracking-[-.075em]">Find your<br />next<br /><span className="text-[#dfff36]">favourite.</span></h1>
                <p className="mt-8 max-w-lg text-sm font-medium leading-7 text-slate-300 sm:text-base">Beautiful products, honest prices, and a thoughtful shopping experience that helps you choose with confidence.</p>
                <div className="mt-9 flex flex-wrap gap-3"><Link to="/home" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#dfff36] px-6 text-sm font-black text-[#101217] transition hover:-translate-y-0.5 hover:bg-[#e7ff65]">Start shopping <ArrowRight className="h-4 w-4" /></Link><Link to="/ai-assistant" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[.05] px-6 text-sm font-bold text-white transition hover:bg-white/10"><Sparkles className="h-4 w-4 text-[#dfff36]" /> Ask Nova AI</Link></div>
              </div>
              <div className="relative z-10 mt-12 flex items-center gap-5 border-t border-white/10 pt-6 text-[10px] font-bold uppercase tracking-[.15em] text-slate-500"><span>{PRODUCTS.length} curated products</span><span className="h-1 w-1 rounded-full bg-[#dfff36]" /><span>11 categories</span></div>
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#ae71ff] via-[#8a50ef] to-[#6534ca] p-8 sm:p-12 lg:min-h-full">
              <div className="absolute inset-0 opacity-25 nc-grid" />
              <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/30" />
              <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-fuchsia-300/25 blur-[90px]" />
              <DepthCard intensity={6} className="relative w-full max-w-[500px] rounded-[2.2rem]">
                <div className="nc-depth-surface relative rotate-[-3deg] rounded-[2.2rem] border-[10px] border-white bg-[#e3473f] p-3 shadow-[0_34px_80px_rgba(46,14,94,.32)] sm:border-[14px]">
                  <div className="relative aspect-[4/4.7] overflow-hidden rounded-[1.25rem] bg-[#ce4038]"><img src={featuredProduct.image} alt={featuredProduct.title} className="h-full w-full object-cover saturate-[1.2] contrast-[1.05]" /><div className="absolute inset-0 bg-gradient-to-t from-red-950/30 via-transparent to-white/10" /></div>
                  <div className="nc-depth-layer-high absolute bottom-8 left-8 rounded-xl bg-white px-4 py-3 text-[#101217] shadow-xl"><p className="text-[9px] font-black uppercase tracking-[.16em] text-violet-600">Featured now</p><p className="mt-1 text-sm font-black">{featuredProduct.title}</p></div>
                </div>
              </DepthCard>
              <motion.div animate={reduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-6 top-8 rounded-2xl bg-[#101217] px-4 py-3 text-white shadow-xl sm:right-10 sm:top-10"><p className="text-[8px] font-black uppercase tracking-[.16em] text-[#dfff36]">Nova pick</p><p className="mt-1 text-sm font-black">98% match</p></motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative hidden min-h-[920px] items-end overflow-hidden pb-16 pt-28 text-white dark:flex sm:min-h-screen sm:pb-20">
        <div className="absolute inset-0 nc-grid opacity-30" /><div className="absolute left-[5%] top-[20%] h-[34rem] w-[34rem] rounded-full bg-[#dfff36]/[.08] blur-[140px]" /><div className="absolute bottom-[-18rem] right-[-8rem] h-[42rem] w-[42rem] rounded-full bg-[#dfff36]/[.06] blur-[150px]" />
        <div className="nc-shell relative grid items-end gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 pb-2"><motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="nc-label flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Intelligent commerce / 2026</motion.p><motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .6 }} className="mt-6 text-display">SHOP<br />BEYOND<br /><span className="text-[#dfff36]">SEARCH.</span></motion.h1><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .22 }} className="mt-8 max-w-md text-sm leading-7 text-slate-400 sm:text-base">A new kind of marketplace—designed to understand intent, reduce noise, and make every choice feel considered.</motion.p><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }} className="mt-9 flex flex-wrap gap-3"><Link to="/register" className="nc-primary">Enter NovaCart <ArrowRight className="h-4 w-4" /></Link><a href="#discover" className="nc-secondary">Explore the vision <ArrowDownRight className="h-4 w-4" /></a></motion.div><div className="mt-12 flex items-center gap-6 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-600"><span>{PRODUCTS.length} products today</span><span className="h-px w-8 bg-white/15" /><span>Built for what comes next</span></div></div>

          <motion.div initial={{ opacity: 0, y: 30, rotate: reduceMotion ? 0 : 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: .15, duration: .8 }} className="nc-depth-scene relative mx-auto w-full max-w-[640px] lg:mb-4">
            <div className="nc-float absolute inset-[12%] rounded-full bg-[#dfff36]/[.12] blur-[90px]" />
            <div aria-hidden="true" className="nc-orbit absolute -inset-4 rounded-[3rem] border border-dashed border-[#dfff36]/20" />
            <DepthCard intensity={7} className="relative aspect-[.82] rounded-[2.5rem]">
              <div className="nc-depth-surface relative h-full overflow-hidden rounded-[2.5rem] border border-white/15 bg-ink-850 p-2 shadow-float">
                <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1300&q=90" alt="Audio category visual preview" className="h-full w-full rounded-[2.1rem] object-cover grayscale-[.15]" />
                <div className="absolute inset-2 rounded-[2.1rem] bg-gradient-to-t from-black/70 via-transparent to-white/5" />
                <div className="nc-depth-layer-high absolute bottom-8 left-8 right-8 flex items-end justify-between gap-5"><div><p className="nc-label">Visual direction 001</p><p className="mt-2 text-2xl font-semibold tracking-[-.04em]">Audio, reimagined.</p><p className="mt-1 text-xs text-slate-400">Curated audio · available now</p></div><span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/30 backdrop-blur"><ArrowUpRight className="h-5 w-5" /></span></div>
              </div>
            </DepthCard>
          </motion.div>
        </div>
      </section>

      <section id="discover" className="border-t border-black/10 py-22 dark:border-white/10 sm:py-30">
        <div className="nc-shell">
          <Reveal className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end"><div><p className="nc-label">Discover the world of NovaCart</p><h2 className="mt-5 max-w-3xl text-h1">Designed around how you want to live.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Explore curated collections across technology, style, home, wellness, reading, food, and play.</p></Reveal>
          <div className="mt-14 grid auto-rows-[300px] gap-4 md:grid-cols-4 md:auto-rows-[260px]">
            {categories.map((category, index) => <Reveal key={category.name} delay={index * .06} className={category.className}><DepthCard intensity={4} className="h-full rounded-[2rem]"><Link to={`/search?q=${category.name}`} className="nc-depth-surface group relative block h-full overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] text-white dark:border-white/10"><img src={category.image} alt={`${category.name} category preview`} loading="lazy" className="h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-[1.055] group-hover:opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" /><div className="nc-depth-layer absolute inset-x-6 bottom-6 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-300">{category.note}</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{category.name}</h3><p className="mt-1 text-xs text-slate-500">{PRODUCTS.filter((product) => product.category === category.name).length} products</p></div><span className="grid h-11 w-11 translate-y-2 place-items-center rounded-full border border-white/15 bg-black/25 opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span></div></Link></DepthCard></Reveal>)}
          </div>
        </div>
      </section>

      <section className="nc-shell pb-24"><Reveal><div className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-[var(--nc-surface)] px-7 py-16 dark:border-white/10 sm:px-12 lg:px-16 lg:py-22"><div className="nc-orbit absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full border border-[#dfff36]/30 shadow-glow" /><p className="nc-label">Nova intelligence</p><h2 className="mt-5 max-w-3xl text-h1">Less noise.<br /><span className="text-slate-500">More knowing.</span></h2><p className="mt-6 max-w-xl text-sm leading-7 text-slate-400">When real catalogue data arrives, Nova will turn intent into grounded comparisons—not invented recommendations.</p><Link to="/ai-assistant" className="nc-secondary mt-8">Meet Nova AI <ArrowUpRight className="h-4 w-4" /></Link></div></Reveal></section>
      <footer className="border-t border-black/10 dark:border-white/10"><div className="nc-shell flex flex-col gap-5 py-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><BrandLogo compact /><span>© {new Date().getFullYear()}</span></div><div className="flex gap-5"><Link to="/support" className="hover:text-slate-950 dark:hover:text-white">Support</Link><Link to="/settings" className="hover:text-slate-950 dark:hover:text-white">Privacy</Link><Link to="/support" className="hover:text-slate-950 dark:hover:text-white">Terms</Link></div></div></footer>
    </main>
  )
}
