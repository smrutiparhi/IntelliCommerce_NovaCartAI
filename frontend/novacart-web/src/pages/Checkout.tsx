import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, PackageOpen, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PRODUCTS } from '../data/store-products'
import { useCheckoutStore, type DeliveryAddress } from '../stores/checkout-store'
import { useCommerceStore } from '../stores/commerce-store'
import { useAuthStore } from '../stores/auth-store'
import { createOrder, serializeAddress } from '../api/orders'

const addressSchema = z.object({
  fullName: z.string().trim().min(3, 'Enter the recipient’s full name'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  line1: z.string().trim().min(5, 'Enter a complete street address'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'Enter the city'),
  state: z.string().trim().min(2, 'Enter the state'),
  postalCode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
})

const fields: Array<{ name: keyof DeliveryAddress; label: string; placeholder: string; wide?: boolean }> = [
  { name: 'fullName', label: 'Full name', placeholder: 'Recipient name', wide: true },
  { name: 'phone', label: 'Mobile number', placeholder: '10-digit mobile number' },
  { name: 'postalCode', label: 'PIN code', placeholder: '6-digit PIN code' },
  { name: 'line1', label: 'Address', placeholder: 'House number, street, area', wide: true },
  { name: 'line2', label: 'Landmark (optional)', placeholder: 'Nearby landmark', wide: true },
  { name: 'city', label: 'City', placeholder: 'City' },
  { name: 'state', label: 'State', placeholder: 'State' },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const cart = useCommerceStore((state) => state.cart)
  const address = useCheckoutStore((state) => state.address)
  const setAddress = useCheckoutStore((state) => state.setAddress)
  const idempotencyKey = useCheckoutStore((state) => state.idempotencyKey)
  const setIdempotencyKey = useCheckoutStore((state) => state.setIdempotencyKey)
  const setActiveOrder = useCheckoutStore((state) => state.setActiveOrder)
  const user = useAuthStore((state) => state.user)
  const [serverError, setServerError] = useState('')
  const items = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = PRODUCTS.find((item) => item.id === id)
    return product ? [{ product, quantity }] : []
  })
  const subtotal = items.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0)
  const originalTotal = items.reduce((sum, item) => sum + (item.product.originalPriceINR ?? item.product.priceINR) * item.quantity, 0)
  const savings = originalTotal - subtotal
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DeliveryAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: address ?? { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '' },
  })

  async function continueToPayment(values: DeliveryAddress) {
    setAddress(values)
    setServerError('')
    const requestKey = idempotencyKey ?? crypto.randomUUID()
    if (!idempotencyKey) setIdempotencyKey(requestKey)
    try {
      const order = await createOrder({
        userId: user?.id ?? '',
        shippingAddressJson: serializeAddress(values),
        idempotencyKey: requestKey,
        items: items.map(({ product, quantity }) => ({ productId: product.id, productName: product.title, productImage: product.image, sellerId: product.sellerId ?? 'novacart-seed', unitPricePaise: product.priceINR * 100, quantity })),
      })
      setActiveOrder(order)
      navigate('/payment')
    } catch {
      setServerError('Order creation is unavailable. Start the Order Service and try again—your cart and address are saved.')
    }
  }

  if (items.length === 0) return <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-12 text-[var(--nc-text)]"><div className="mx-auto max-w-3xl"><section className="rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] px-6 py-20 text-center shadow-card dark:border-white/10"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-slate-950 text-white"><PackageOpen className="h-8 w-8" /></div><p className="nc-label mt-7">Checkout paused</p><h1 className="mt-3 text-h2">Your cart has no items.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">Add a product before entering delivery or payment information.</p><Link to="/categories" className="nc-primary mt-8">Explore products <ArrowRight className="h-4 w-4" /></Link></section></div></main>

  return (
    <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-10 text-[var(--nc-text)] sm:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-violet-600 dark:hover:text-[#dfff36]"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="nc-label">Secure purchase</p><h1 className="mt-3 text-h1">Checkout</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-500">Confirm where your order should arrive before continuing to protected payment.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"><ShieldCheck className="h-4 w-4" /> Secure flow</div></div>

        <ol aria-label="Checkout progress" className="mt-9 grid grid-cols-3 gap-2">{[{ label: 'Cart', icon: ShoppingBag }, { label: 'Delivery', icon: MapPin }, { label: 'Payment', icon: CreditCard }].map(({ label, icon: Icon }, index) => <li key={label} className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-xs font-bold ${index < 2 ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-[#dfff36]/20 dark:bg-[#dfff36]/[.06] dark:text-[#dfff36]' : 'border-black/10 bg-[var(--nc-surface)] text-slate-500 dark:border-white/10'}`}>{index === 0 ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}{label}</li>)}</ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form onSubmit={handleSubmit(continueToPayment)} className="rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-6 shadow-[0_20px_60px_rgba(30,26,18,.07)] dark:border-white/10 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-[#dfff36]/10 dark:text-[#dfff36]"><MapPin className="h-5 w-5" /></span><div><p className="text-lg font-black">Delivery address</p><p className="mt-1 text-xs text-slate-500">Used only to fulfil this order.</p></div></div><div className="mt-7 grid gap-5 sm:grid-cols-2">{fields.map((field) => <label key={field.name} className={`block ${field.wide ? 'sm:col-span-2' : ''}`}><span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-400">{field.label}</span><input {...register(field.name)} inputMode={field.name === 'phone' || field.name === 'postalCode' ? 'numeric' : undefined} autoComplete={field.name === 'fullName' ? 'name' : field.name === 'phone' ? 'tel' : field.name === 'postalCode' ? 'postal-code' : field.name === 'city' ? 'address-level2' : field.name === 'state' ? 'address-level1' : 'street-address'} placeholder={field.placeholder} className={`h-12 w-full rounded-xl border bg-black/[.025] px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:bg-white/[.035] dark:text-white dark:focus:border-[#dfff36]/60 ${errors[field.name] ? 'border-rose-500' : 'border-black/10 dark:border-white/10'}`} />{errors[field.name] && <span role="alert" className="mt-1.5 block text-xs text-rose-500">{errors[field.name]?.message}</span>}</label>)}</div>{serverError && <p role="alert" className="mt-5 rounded-xl border border-rose-300/40 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">{serverError}</p>}<button disabled={isSubmitting} className="nc-primary mt-8 w-full">{isSubmitting ? 'Creating secure order…' : 'Continue to payment'} <ArrowRight className="h-4 w-4" /></button><p className="mt-4 text-center text-[11px] text-slate-500">You can review the final amount before confirming payment.</p></form>

          <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl lg:sticky lg:top-28"><p className="text-xs font-black uppercase tracking-[.18em] text-[#dfff36]">Order summary</p><p className="mt-2 text-xs text-slate-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p><div className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-1">{items.map(({ product, quantity }) => <div key={product.id} className="grid grid-cols-[58px_1fr_auto] items-center gap-3"><img src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0"><p className="truncate text-xs font-bold">{product.title}</p><p className="mt-1 text-[10px] text-slate-500">Qty {quantity}</p></div><p className="text-xs font-bold">₹{(product.priceINR * quantity).toLocaleString('en-IN')}</p></div>)}</div><div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm"><div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><div className="flex justify-between text-slate-400"><span>Delivery</span><span className="text-emerald-400">Free</span></div>{savings > 0 && <div className="flex justify-between text-emerald-400"><span>Savings</span><span>−₹{savings.toLocaleString('en-IN')}</span></div>}<div className="flex items-end justify-between border-t border-white/10 pt-5"><span className="text-slate-400">Total</span><strong className="text-2xl">₹{subtotal.toLocaleString('en-IN')}</strong></div></div></aside>
        </div>
      </div>
    </main>
  )
}
