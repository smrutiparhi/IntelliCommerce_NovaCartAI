import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { ArrowRight, LockKeyhole, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCommerceStore } from '../../stores/commerce-store'
import { useCartItems } from '../../hooks/useCartItems'
import { useDialog } from '../../hooks/useDialog'
import { replaceBrokenProductImage } from '../../lib/product-image'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, unresolvedIds, isLoading } = useCartItems()
  const updateQuantity = useCommerceStore((state) => state.updateQuantity)
  const removeFromCart = useCommerceStore((state) => state.removeFromCart)
  const cart = useCommerceStore((state) => state.cart)
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const subtotal = items.reduce((sum, {product,quantity}) => sum + product.priceINR*quantity,0)
  const ref = useDialog<HTMLElement>(open,onClose)
  return createPortal(<AnimatePresence>{open && <motion.div className="nc-drawer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(event) => { if(event.target === event.currentTarget) onClose() }}>
    <motion.aside ref={ref} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" className="nc-drawer" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{duration:.3,ease:[.22,1,.36,1]}}>
      <div className="nc-drawer-head"><div><p className="nc-label">Saved a little space for you</p><h2 id="cart-drawer-title">Your bag <span className="nc-muted text-base">({count})</span></h2></div><button className="nc-icon-button" onClick={onClose} aria-label="Close cart"><X size={18} /></button></div>
      <div className="nc-drawer-items">
        {!count ? <div className="flex h-full flex-col items-center justify-center text-center"><span className="grid h-20 w-20 place-items-center rounded-full bg-[var(--nc-soft)] text-[var(--nc-accent)]"><ShoppingBag size={28} /></span><h3 className="mt-6 text-2xl font-semibold tracking-tight">Room for something good.</h3><p className="nc-muted mt-3 max-w-64 text-xs leading-6">Your bag is a blank canvas. Let's find your next favourite.</p><Link to="/home" onClick={onClose} className="nc-primary mt-7">Find your thing <ArrowRight size={14} /></Link></div>
        : <>{items.map(({product,quantity}) => <article key={product.id} className="nc-drawer-item">
          <Link to={`/products/${product.id}`} onClick={onClose}><img src={product.image} alt={product.title} onError={(event) => replaceBrokenProductImage(event,product.title,product.brand)} /></Link>
          <div className="min-w-0 flex-1"><p className="nc-muted mb-1 text-[10px]">{product.brand}</p><h3 className="line-clamp-2">{product.title}</h3><p className="mt-2 text-xs font-semibold">₹{(product.priceINR*quantity).toLocaleString('en-IN')}</p><div className="mt-3 flex items-center justify-between"><div className="nc-quantity"><button aria-label={`Decrease ${product.title} quantity`} onClick={() => updateQuantity(product.id,quantity-1)}><Minus size={12} /></button><span>{quantity}</span><button disabled={quantity >= 10} aria-label={`Increase ${product.title} quantity`} onClick={() => updateQuantity(product.id,quantity+1)}><Plus size={12} /></button></div><button onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.title}`} className="nc-muted p-2 hover:text-rose-500"><Trash2 size={14} /></button></div></div>
        </article>)}{unresolvedIds.map((id) => <div key={id} className="nc-drawer-item items-center justify-between"><div><p className="text-xs">{isLoading ? 'Loading product…' : 'Product details unavailable'}</p><p className="nc-muted mt-2 text-[10px]">Quantity {cart[id]}</p></div><button className="nc-text-link" onClick={() => removeFromCart(id)}>Remove</button></div>)}</>}
      </div>
      {count > 0 && <div className="nc-drawer-total"><div><span>Subtotal</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div><p>Review delivery and apply your coupon at checkout.</p><Link to="/cart" onClick={onClose} className="nc-secondary mt-5 w-full">Review your bag</Link>{unresolvedIds.length === 0 && <Link to="/checkout" onClick={onClose} className="nc-primary mt-3 w-full">Continue to checkout <ArrowRight size={14} /></Link>}<p className="mt-4 flex justify-center items-center gap-1.5"><LockKeyhole size={11} /> Secure checkout, peace of mind.</p></div>}
    </motion.aside>
  </motion.div>}</AnimatePresence>,document.body)
}
