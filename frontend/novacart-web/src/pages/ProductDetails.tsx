import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCommerceStore } from '../stores/commerce-store'
import { useCatalogue, useProduct } from '../hooks/useCatalogue'

const details = ['Overview', 'Specifications', 'Shipping & returns', 'Reviews']
const imageViews = [
  { label: 'Full product view', position: 'center', scale: 'scale-100' },
  { label: 'Product detail view', position: 'center', scale: 'scale-[1.18]' },
  { label: 'Alternate product view', position: '60% center', scale: 'scale-[1.08]' },
]

export function ProductDetailsPage() {
  const { id } = useParams()
  const { data: productResult, isLoading } = useProduct(id)
  const { data: catalogue } = useCatalogue()
  const product = productResult?.product
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [openDetail, setOpenDetail] = useState('Overview')
  const saved = useCommerceStore((state) => product ? state.wishlist.includes(product.id) : false)
  const cartQuantity = useCommerceStore((state) => product ? state.cart[product.id] ?? 0 : 0)
  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist)
  const addToCart = useCommerceStore((state) => state.addToCart)

  const detailCopy = (detail: string) => {
    if (!product) return ''
    if (detail === 'Overview') return product.description
    if (detail === 'Specifications') return `Key details: ${product.tags.join(' · ')}.`
    if (detail === 'Shipping & returns') return `${product.delivery ?? 'Delivery calculated at checkout'}. Easy returns within 7 days in the original condition.`
    return `Rated ${product.rating} out of 5 from ${product.reviewsCount} verified catalogue ratings.`
  }

  if (isLoading) return <div className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-16 text-[var(--nc-text)]"><div className="nc-shell grid animate-pulse gap-10 lg:grid-cols-2"><div className="aspect-square rounded-[2.5rem] bg-black/[.06] dark:bg-white/[.05]" /><div className="space-y-5 pt-8"><div className="h-3 w-28 rounded-full bg-black/10 dark:bg-white/10" /><div className="h-20 max-w-lg rounded-2xl bg-black/[.06] dark:bg-white/[.05]" /><div className="h-12 w-48 rounded-2xl bg-black/[.06] dark:bg-white/[.05]" /></div></div></div>
  if (!product) return <div className="flex min-h-[70vh] items-center bg-[var(--nc-bg)] px-5 py-20 text-center text-[var(--nc-text)]"><div className="mx-auto max-w-lg"><p className="nc-label">Product unavailable</p><h1 className="mt-5 text-h2">We could not find that product.</h1><p className="mt-5 text-sm leading-7 text-slate-500">The link may be outdated. Explore the current NovaCart catalogue to find something nearby.</p><Link to="/search" className="nc-primary mt-8"><ArrowLeft className="h-4 w-4" /> Browse products</Link></div></div>

  const discount = product.originalPriceINR ? Math.round((1 - product.priceINR / product.originalPriceINR) * 100) : 0
  const related = (catalogue?.products ?? []).filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3)

  return (
    <main className="min-h-screen bg-[var(--nc-bg)] py-8 text-[var(--nc-text)] lg:py-12">
      <div className="nc-shell">
        <Link to="/search" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950 dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to discovery</Link>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] xl:gap-16">
          <section>
            <div className="group relative aspect-square overflow-hidden rounded-[2.5rem] border border-black/10 bg-[var(--nc-surface)] shadow-[0_24px_80px_rgba(34,30,22,.08)] dark:border-white/10 dark:shadow-float">
              <AnimatePresence mode="wait">
                <motion.img key={activeImage} src={product.image} alt={product.title} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }} className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] ${imageViews[activeImage].scale}`} style={{ objectPosition: imageViews[activeImage].position }} />
              </AnimatePresence>
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-6">
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white backdrop-blur-xl">{product.brand}</span>
                {discount > 0 && <span className="rounded-full bg-[#dfff36] px-3 py-2 text-[10px] font-black text-[#101217]">{discount}% OFF</span>}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">{imageViews.map((view, index) => <button key={view.label} onClick={() => setActiveImage(index)} className={`relative aspect-[4/3] overflow-hidden rounded-2xl border bg-[var(--nc-surface)] p-1 transition ${activeImage === index ? 'border-violet-500 ring-2 ring-violet-500/15 dark:border-[#dfff36] dark:ring-[#dfff36]/10' : 'border-black/10 opacity-65 hover:opacity-100 dark:border-white/10'}`} aria-label={view.label}><img src={product.image} alt="" className={`h-full w-full rounded-xl object-cover ${view.scale}`} style={{ objectPosition: view.position }} /><span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur">0{index + 1}</span></button>)}</div>
          </section>

          <section className="lg:sticky lg:top-28 lg:h-fit">
            <p className="nc-label">{product.category} / {product.brand}</p>
            <h1 className="mt-5 text-h2">{product.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm"><span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 font-bold text-violet-800 dark:bg-[#dfff36]/10 dark:text-[#dfff36]"><Star className="h-3.5 w-3.5 fill-current" />{product.rating}</span><span className="text-slate-500">{product.reviewsCount} verified reviews</span></div>
            <div className="mt-8 flex flex-wrap items-baseline gap-3"><p className="text-3xl font-semibold tracking-[-.04em]">₹{product.priceINR.toLocaleString('en-IN')}</p>{product.originalPriceINR && <><p className="text-sm text-slate-500 line-through">₹{product.originalPriceINR.toLocaleString('en-IN')}</p><p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Save ₹{(product.originalPriceINR - product.priceINR).toLocaleString('en-IN')}</p></>}</div>
            <p className="mt-2 text-xs text-slate-500">Inclusive of all taxes</p>
            <p className="mt-7 text-sm leading-7 text-slate-600 dark:text-slate-400">{product.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[{ icon: Truck, title: 'Fast delivery', copy: product.delivery ?? 'At checkout' }, { icon: RotateCcw, title: 'Easy returns', copy: 'Within 7 days' }, { icon: ShieldCheck, title: 'Secure payment', copy: 'Protected checkout' }].map(({ icon: Icon, title, copy }) => <div key={title} className="rounded-2xl border border-black/10 bg-[var(--nc-surface)] p-4 dark:border-white/10"><Icon className="h-4 w-4 text-violet-600 dark:text-[#dfff36]" /><p className="mt-3 text-xs font-bold">{title}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{copy}</p></div>)}
            </div>

            <div className="mt-8 flex items-center justify-between border-y border-black/10 py-5 dark:border-white/10"><span className="text-xs font-semibold text-slate-500">Quantity</span><div className="flex items-center rounded-full border border-black/10 bg-black/[.035] p-1 dark:border-white/10 dark:bg-white/[.04]"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-black/[.07] dark:hover:bg-white/10" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button><span className="w-9 text-center text-xs font-bold">{quantity}</span><button onClick={() => setQuantity((value) => Math.min(10, value + 1))} className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-black/[.07] dark:hover:bg-white/10" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button></div></div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"><button onClick={() => addToCart(product.id, quantity)} className="nc-primary">{cartQuantity > 0 ? <><Check className="h-4 w-4" /> {cartQuantity} in cart</> : <><ShoppingBag className="h-4 w-4" /> Add {quantity} to cart</>}</button><button onClick={() => toggleWishlist(product.id)} aria-pressed={saved} className="nc-secondary px-5"><Heart className={`h-4 w-4 ${saved ? 'fill-current text-rose-500' : ''}`} /> {saved ? 'Saved' : 'Save'}</button></div>
            <Link to="/checkout" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 text-sm font-bold text-white transition hover:bg-violet-700 dark:bg-white dark:text-[#101217] dark:hover:bg-[#dfff36]">Buy now <ArrowRight className="h-4 w-4" /></Link>

            <div className="mt-8 divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10">{details.map((detail) => <div key={detail}><button onClick={() => setOpenDetail(openDetail === detail ? '' : detail)} aria-expanded={openDetail === detail} className="flex w-full items-center justify-between py-5 text-left text-sm font-semibold"><span>{detail}</span><ChevronDown className={`h-4 w-4 text-slate-500 transition ${openDetail === detail ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{openDetail === detail && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pb-5 text-sm leading-7 text-slate-500">{detailCopy(detail)}</motion.p>}</AnimatePresence></div>)}</div>
          </section>
        </div>

        {related.length > 0 && <section className="border-t border-black/10 py-20 dark:border-white/10 lg:py-24"><div className="flex items-end justify-between gap-6"><div><p className="nc-label">More in {product.category}</p><h2 className="mt-4 text-h2">You may also like.</h2></div><Link to={`/search?q=${product.category}`} className="hidden items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white sm:flex">View collection <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <Link key={item.id} to={`/products/${item.id}`} className="group overflow-hidden rounded-[1.7rem] border border-black/10 bg-[var(--nc-surface)] p-2 transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10"><div className="aspect-[4/3] overflow-hidden rounded-[1.3rem]"><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="flex items-end justify-between gap-4 p-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-[#dfff36]">{item.brand}</p><h3 className="mt-2 text-sm font-semibold">{item.title}</h3></div><p className="shrink-0 text-sm font-bold">₹{item.priceINR.toLocaleString('en-IN')}</p></div></Link>)}</div></section>}
      </div>
    </main>
  )
}
