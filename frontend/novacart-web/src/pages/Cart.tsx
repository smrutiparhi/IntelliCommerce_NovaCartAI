import { ArrowRight, Minus, PackageOpen, Plus, RotateCcw, ShieldCheck, ShoppingBag, Sparkles, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PRODUCTS } from '../data/store-products'
import { useCommerceStore } from '../stores/commerce-store'

const assurances = [
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Payment details stay protected.' },
  { icon: RotateCcw, title: 'Clear returns', text: 'Return terms shown before payment.' },
]

export function CartPage() {
  const cart = useCommerceStore((state) => state.cart)
  const updateQuantity = useCommerceStore((state) => state.updateQuantity)
  const removeFromCart = useCommerceStore((state) => state.removeFromCart)
  const clearCart = useCommerceStore((state) => state.clearCart)
  const items = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = PRODUCTS.find((item) => item.id === id)
    return product ? [{ product, quantity }] : []
  })
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0)
  const originalTotal = items.reduce((sum, item) => sum + (item.product.originalPriceINR ?? item.product.priceINR) * item.quantity, 0)
  const savings = originalTotal - subtotal

  return (
    <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-10 text-[var(--nc-text)] sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[1380px]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="nc-label">Your bag</p><h1 className="mt-3 text-h1">Shopping cart</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-500">Review your items, quantities, and totals before moving to secure checkout.</p></div><div className="flex items-center gap-3"><div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-black/[.035] px-4 py-2 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ShoppingBag className="h-4 w-4 text-violet-600 dark:text-[#dfff36]" /> {itemCount} {itemCount === 1 ? 'item' : 'items'}</div>{items.length > 0 && <button onClick={clearCart} className="text-xs font-bold text-slate-500 hover:text-rose-500">Clear cart</button>}</div></div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {items.length === 0 ? <section className="relative flex min-h-[480px] items-center overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] px-6 py-16 text-center shadow-card dark:border-white/10 sm:px-10"><div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-violet-200/40 blur-3xl dark:bg-[#dfff36]/[.04]" /><div className="relative mx-auto max-w-lg"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-slate-950 text-white shadow-xl"><PackageOpen className="h-8 w-8" /></div><p className="nc-label mt-7">Your cart is empty</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">Ready for your first product.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">Browse the live catalogue and add anything that feels right.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/categories" className="nc-primary">Shop products <ArrowRight className="h-4 w-4" /></Link><Link to="/ai-assistant" className="nc-secondary"><Sparkles className="h-4 w-4" /> Ask Nova</Link></div></div></section> : <section className="space-y-4">{items.map(({ product, quantity }) => <article key={product.id} className="grid gap-5 rounded-[1.75rem] border border-black/10 bg-[var(--nc-surface)] p-3 shadow-[0_14px_45px_rgba(35,30,20,.06)] dark:border-white/10 sm:grid-cols-[180px_1fr] sm:p-4"><Link to={`/products/${product.id}`} className="aspect-square overflow-hidden rounded-[1.3rem] bg-[var(--nc-surface-raised)] sm:aspect-[4/3]"><img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" /></Link><div className="flex min-w-0 flex-col justify-between gap-5 py-2 sm:pr-2"><div className="flex items-start justify-between gap-4"><div><p className="nc-label">{product.brand} / {product.category}</p><Link to={`/products/${product.id}`} className="mt-2 block text-lg font-bold hover:text-violet-600 dark:hover:text-[#dfff36]">{product.title}</Link><p className="mt-2 text-xs text-slate-500">{product.delivery}</p></div><button onClick={() => removeFromCart(product.id)} className="nc-icon-button" aria-label={`Remove ${product.title}`}><Trash2 className="h-4 w-4" /></button></div><div className="flex flex-wrap items-end justify-between gap-4"><div className="flex items-center rounded-full border border-black/10 bg-black/[.035] p-1 dark:border-white/10 dark:bg-white/[.04]"><button onClick={() => updateQuantity(product.id, quantity - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/[.06] dark:hover:bg-white/10" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button><span className="w-9 text-center text-xs font-black">{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/[.06] dark:hover:bg-white/10" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button></div><div className="text-right"><p className="text-lg font-black">₹{(product.priceINR * quantity).toLocaleString('en-IN')}</p>{product.originalPriceINR && <p className="mt-1 text-xs text-slate-500 line-through">₹{(product.originalPriceINR * quantity).toLocaleString('en-IN')}</p>}</div></div></div></article>)}</section>}

          <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-7 lg:sticky lg:top-28"><p className="text-xs font-black uppercase tracking-[.18em] text-[#dfff36]">Order summary</p><div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm"><div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><div className="flex justify-between text-slate-400"><span>Delivery</span><span>{items.length ? 'Free' : '—'}</span></div>{savings > 0 && <div className="flex justify-between text-emerald-400"><span>You save</span><span>−₹{savings.toLocaleString('en-IN')}</span></div>}</div><div className="flex items-end justify-between py-6"><div><p className="text-sm text-slate-400">Total</p><p className="mt-1 text-xs text-slate-500">Taxes included</p></div><strong className="text-3xl tracking-[-.04em]">₹{subtotal.toLocaleString('en-IN')}</strong></div>{items.length > 0 ? <Link to="/checkout" className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#dfff36] text-sm font-black text-[#101217] transition hover:bg-[#e7ff65]">Secure checkout <ArrowRight className="h-4 w-4" /></Link> : <button type="button" disabled className="flex h-13 w-full cursor-not-allowed items-center justify-center rounded-full bg-white/10 text-sm font-black text-white/40">Cart is empty</button>}<p className="mt-4 text-center text-xs leading-5 text-slate-500">Secure checkout with transparent pricing.</p></aside>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">{assurances.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3 rounded-2xl border border-black/10 bg-[var(--nc-surface)] p-5 dark:border-white/10"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 dark:bg-[#dfff36]/10 dark:text-[#dfff36]"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>)}</div>
      </div>
    </main>
  )
}
