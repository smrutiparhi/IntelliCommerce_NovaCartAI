import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ShoppingBag, Star, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { StoreProduct } from '../../data/store-products'
import { useCommerceStore } from '../../stores/commerce-store'

export function QuickViewModal({ product, open, onClose }: { product: StoreProduct; open: boolean; onClose: () => void }) {
  const cartQuantity = useCommerceStore((state) => state.cart[product.id] ?? 0)
  const addToCart = useCommerceStore((state) => state.addToCart)

  useEffect(() => {
    if (!open) return
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [open, onClose])

  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><motion.section role="dialog" aria-modal="true" aria-labelledby={`quick-${product.id}`} initial={{ opacity: 0, scale: .97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98, y: 8 }} transition={{ duration: .22 }} className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] text-[var(--nc-text)] shadow-float dark:border-white/15 md:grid-cols-2"><button autoFocus onClick={onClose} className="nc-icon-button absolute right-4 top-4 z-10" aria-label="Close quick view"><X className="h-4 w-4" /></button><div className="aspect-square bg-[var(--nc-surface-raised)]"><img src={product.image} alt={product.title} className="h-full w-full object-cover" /></div><div className="flex flex-col justify-center p-7 sm:p-10"><p className="nc-label">{product.brand} / {product.category}</p><h2 id={`quick-${product.id}`} className="mt-4 text-3xl font-semibold tracking-[-.045em]">{product.title}</h2><div className="mt-4 flex items-center gap-2 text-sm"><Star className="h-4 w-4 fill-violet-500 text-violet-500 dark:fill-[#dfff36] dark:text-[#dfff36]" /><strong>{product.rating}</strong><span className="text-slate-500">{product.reviewsCount} reviews</span></div><p className="mt-7 text-2xl font-semibold">₹{product.priceINR.toLocaleString('en-IN')}</p><p className="mt-5 text-sm leading-7 text-slate-500">{product.description}</p><button onClick={() => addToCart(product.id)} className="nc-primary mt-8">{cartQuantity > 0 ? <><Check className="h-4 w-4" /> {cartQuantity} in cart</> : <><ShoppingBag className="h-4 w-4" /> Add to cart</>}</button><Link to={`/products/${product.id}`} onClick={onClose} className="nc-secondary mt-3">View full product <ArrowRight className="h-4 w-4" /></Link></div></motion.section></motion.div>}</AnimatePresence>
}
