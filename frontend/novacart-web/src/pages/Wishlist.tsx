import { ArrowRight, Heart, PackageOpen, ShoppingBag, Sparkles, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PRODUCTS } from '../data/store-products'
import { useCommerceStore } from '../stores/commerce-store'

export function WishlistPage() {
  const wishlist = useCommerceStore((state) => state.wishlist)
  const removeFromWishlist = useCommerceStore((state) => state.removeFromWishlist)
  const addToCart = useCommerceStore((state) => state.addToCart)
  const cart = useCommerceStore((state) => state.cart)
  const products = wishlist.flatMap((id) => {
    const product = PRODUCTS.find((item) => item.id === id)
    return product ? [product] : []
  })

  return (
    <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-10 text-[var(--nc-text)] sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[1380px]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="nc-label">Saved for later</p><h1 className="mt-3 text-h1">Your wishlist</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-500">Keep everything you love in one place and move it to your cart whenever you are ready.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-black/[.035] px-4 py-2 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><Heart className="h-4 w-4 text-rose-500" /> {products.length} saved</div></div>

        {products.length === 0 ? <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] px-6 py-16 text-center shadow-card dark:border-white/10 sm:px-10 sm:py-24"><div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-violet-200/40 blur-3xl dark:bg-[#dfff36]/[.04]" /><div className="relative mx-auto max-w-xl"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-slate-950 text-white shadow-xl"><PackageOpen className="h-8 w-8" /></div><p className="nc-label mt-7">Nothing saved yet</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">Your favourites will live here.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">Tap the heart on any catalogue product to build your personal shortlist.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/categories" className="nc-primary">Explore products <ArrowRight className="h-4 w-4" /></Link><Link to="/ai-assistant" className="nc-secondary"><Sparkles className="h-4 w-4" /> Ask Nova</Link></div></div></section> : <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <article key={product.id} className="group flex flex-col overflow-hidden rounded-[1.7rem] border border-black/10 bg-[var(--nc-surface)] p-2 shadow-[0_14px_40px_rgba(20,18,14,.06)] dark:border-white/10"><div className="relative aspect-square overflow-hidden rounded-[1.3rem]"><Link to={`/products/${product.id}`}><img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></Link><button onClick={() => removeFromWishlist(product.id)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-rose-500 shadow-md transition hover:scale-105" aria-label={`Remove ${product.title} from wishlist`}><Trash2 className="h-4 w-4" /></button></div><div className="flex flex-1 flex-col p-4"><p className="nc-label">{product.brand}</p><Link to={`/products/${product.id}`} className="mt-2 line-clamp-2 text-sm font-bold hover:text-violet-600 dark:hover:text-[#dfff36]">{product.title}</Link><div className="mt-auto flex items-end justify-between gap-3 pt-5"><div><p className="text-lg font-black">₹{product.priceINR.toLocaleString('en-IN')}</p>{product.originalPriceINR && <p className="text-xs text-slate-500 line-through">₹{product.originalPriceINR.toLocaleString('en-IN')}</p>}</div><button onClick={() => addToCart(product.id)} className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-violet-600 dark:bg-[#dfff36] dark:text-[#101217]" aria-label={`Add ${product.title} to cart`}><ShoppingBag className={`h-4 w-4 ${cart[product.id] ? 'fill-current' : ''}`} /></button></div></div></article>)}</section>}
      </div>
    </main>
  )
}
