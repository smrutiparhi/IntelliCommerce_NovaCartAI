import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, PackageOpen, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS } from '../../data/store-products'
import { useCommerceStore } from '../../stores/commerce-store'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useCommerceStore((state) => state.cart)
  const updateQuantity = useCommerceStore((state) => state.updateQuantity)
  const removeFromCart = useCommerceStore((state) => state.removeFromCart)
  const items = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = PRODUCTS.find((item) => item.id === id)
    return product ? [{ product, quantity }] : []
  })
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0)

  useEffect(() => {
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', keydown)
    return () => { window.removeEventListener('keydown', keydown); document.body.style.overflow = overflow }
  }, [open, onClose])

  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-80 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><motion.aside role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }} className="ml-auto flex h-full w-full max-w-md flex-col border-l border-black/10 bg-[var(--nc-surface)] p-5 text-[var(--nc-text)] shadow-float dark:border-white/10 sm:p-7"><div className="flex items-center justify-between border-b border-black/10 pb-5 dark:border-white/10"><div><p className="nc-label">Your bag</p><h2 id="cart-drawer-title" className="mt-2 text-2xl font-semibold tracking-[-.04em]">Shopping cart <span className="text-base text-slate-500">({itemCount})</span></h2></div><button autoFocus onClick={onClose} className="nc-icon-button" aria-label="Close cart"><X className="h-4 w-4" /></button></div>{items.length === 0 ? <div className="flex flex-1 items-center justify-center py-10 text-center"><div className="max-w-xs"><span className="mx-auto grid h-16 w-16 place-items-center rounded-[1.35rem] border border-black/10 bg-black/[.035] dark:border-white/10 dark:bg-white/[.04]"><PackageOpen className="h-6 w-6 text-violet-600 dark:text-[#dfff36]" /></span><p className="mt-6 text-xl font-semibold tracking-tight">Your cart is waiting for something extraordinary.</p><p className="mt-3 text-sm leading-6 text-slate-500">Explore the catalogue to add your first item.</p><Link to="/categories" onClick={onClose} className="nc-primary mt-7">Explore categories <ArrowRight className="h-4 w-4" /></Link></div></div> : <div className="flex-1 space-y-4 overflow-y-auto py-5">{items.map(({ product, quantity }) => <article key={product.id} className="grid grid-cols-[76px_1fr] gap-3 rounded-2xl border border-black/10 p-2 dark:border-white/10"><Link to={`/products/${product.id}`} onClick={onClose} className="aspect-square overflow-hidden rounded-xl"><img src={product.image} alt={product.title} className="h-full w-full object-cover" /></Link><div className="min-w-0 py-1"><div className="flex items-start justify-between gap-2"><div><p className="truncate text-xs font-bold">{product.title}</p><p className="mt-1 text-xs text-slate-500">₹{product.priceINR.toLocaleString('en-IN')}</p></div><button onClick={() => removeFromCart(product.id)} className="text-slate-500 hover:text-rose-500" aria-label={`Remove ${product.title}`}><Trash2 className="h-3.5 w-3.5" /></button></div><div className="mt-3 flex w-fit items-center rounded-full border border-black/10 dark:border-white/10"><button onClick={() => updateQuantity(product.id, quantity - 1)} className="grid h-7 w-7 place-items-center" aria-label="Decrease quantity"><Minus className="h-3 w-3" /></button><span className="w-7 text-center text-[10px] font-black">{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} className="grid h-7 w-7 place-items-center" aria-label="Increase quantity"><Plus className="h-3 w-3" /></button></div></div></article>)}</div>}<div className="border-t border-black/10 pt-5 dark:border-white/10"><div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div><Link to="/cart" onClick={onClose} className="nc-secondary mt-5 w-full"><ShoppingBag className="h-4 w-4" /> View cart</Link>{items.length > 0 && <Link to="/checkout" onClick={onClose} className="nc-primary mt-3 w-full">Checkout <ArrowRight className="h-4 w-4" /></Link>}</div></motion.aside></motion.div>}</AnimatePresence>
}
