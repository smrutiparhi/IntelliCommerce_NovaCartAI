import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, MapPin, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getOrder } from '../api/orders'
import { getPayment, processPayment } from '../api/payments'
import { PRODUCTS } from '../data/store-products'
import { useCheckoutStore } from '../stores/checkout-store'
import { useCommerceStore } from '../stores/commerce-store'
import { useAuthStore } from '../stores/auth-store'

export function PaymentPage() {
  const cart = useCommerceStore((state) => state.cart)
  const address = useCheckoutStore((state) => state.address)
  const activeOrder = useCheckoutStore((state) => state.activeOrder)
  const setActiveOrder = useCheckoutStore((state) => state.setActiveOrder)
  const finishCheckout = useCheckoutStore((state) => state.finishCheckout)
  const clearCart = useCommerceStore((state) => state.clearCart)
  const user = useAuthStore((state) => state.user)
  const [refreshError, setRefreshError] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [paymentSubmitted, setPaymentSubmitted] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentReady, setPaymentReady] = useState(false)
  const items = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = PRODUCTS.find((item) => item.id === id)
    return product ? [{ product, quantity }] : []
  })
  const total = activeOrder ? activeOrder.totalPaise / 100 : items.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0)

  useEffect(() => {
    const shouldPoll = activeOrder?.sagaState === 'ORDER_PLACED' || (paymentSubmitted && activeOrder?.sagaState === 'STOCK_RESERVED')
    if (!activeOrder?.id || !shouldPoll) return
    let cancelled = false
    const refresh = async () => {
      try {
        const order = await getOrder(activeOrder.id)
        if (!cancelled) { setActiveOrder(order); setRefreshError(false) }
      } catch {
        if (!cancelled) setRefreshError(true)
      }
    }
    void refresh()
    const interval = window.setInterval(refresh, 1500)
    return () => { cancelled = true; window.clearInterval(interval) }
  }, [activeOrder?.id, activeOrder?.sagaState, paymentSubmitted, setActiveOrder])

  useEffect(() => {
    if (!activeOrder?.id || activeOrder.sagaState !== 'STOCK_RESERVED' || paymentReady) return
    let cancelled = false
    let attempts = 0
    const check = async () => {
      attempts += 1
      try {
        await getPayment(activeOrder.id)
        if (!cancelled) setPaymentReady(true)
      } catch {
        if (!cancelled && attempts >= 10) setPaymentError('Payment setup is taking longer than expected. Your reserved items are safe; please wait and retry.')
      }
    }
    void check()
    const interval = window.setInterval(check, 1000)
    return () => { cancelled = true; window.clearInterval(interval) }
  }, [activeOrder?.id, activeOrder?.sagaState, paymentReady])

  if (!items.length || !address || !activeOrder) return (
    <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-12 text-[var(--nc-text)]"><div className="mx-auto max-w-3xl"><section className="rounded-[2rem] bg-slate-950 px-6 py-20 text-center text-white">
      <CreditCard className="mx-auto h-10 w-10 text-[#dfff36]" /><p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-[#dfff36]">Payment protected</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">A server order is required.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400">Confirm your cart and delivery address so the Order Service can create a verified order.</p><Link to="/checkout" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-slate-950"><ArrowLeft className="h-4 w-4" /> Return to checkout</Link>
    </section></div></main>
  )

  const reserving = activeOrder.sagaState === 'ORDER_PLACED'
  const reserved = activeOrder.sagaState === 'STOCK_RESERVED'
  const reservationFailed = activeOrder.sagaState === 'STOCK_RESERVATION_FAILED'
  const paid = activeOrder.sagaState === 'PAYMENT_SUCCESSFUL' || activeOrder.status === 'CONFIRMED'
  const stateTone = reservationFailed ? 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300' : (reserved || paid) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300'

  const pay = async () => {
    if (!user || !reserved || isPaying) return
    setIsPaying(true)
    setPaymentError('')
    try {
      const payment = await processPayment(activeOrder.id, user.id, activeOrder.totalPaise)
      if (payment.status !== 'CAPTURED') throw new Error(payment.failureReason || 'Payment was not completed')
      setPaymentSubmitted(true)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment could not be completed. Please try again.')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-12 text-[var(--nc-text)] sm:px-8 lg:py-16"><div className="mx-auto max-w-5xl">
      <Link to="/checkout" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 dark:hover:text-[#dfff36]"><ArrowLeft className="h-4 w-4" /> Edit delivery details</Link>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-6 shadow-card dark:border-white/10 sm:p-8">
          <p className="nc-label">Order {activeOrder.orderNumber}</p><h1 className="mt-3 text-h2">Choose payment.</h1><p className="mt-4 text-sm leading-6 text-slate-500">Your order is verified by the server. NovaCart reserves every item before payment can begin.</p>
          <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${stateTone}`}>
            {reserving && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}{(reserved || paid) && <CheckCircle2 className="h-3.5 w-3.5" />}{reservationFailed && <TriangleAlert className="h-3.5 w-3.5" />}{activeOrder.sagaState.replace(/_/g, ' ')}
          </div>
          {refreshError && reserving && <p className="mt-3 text-xs text-amber-600">Connection interrupted. We are continuing to check your order.</p>}
          <div className="mt-8 rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 dark:border-[#dfff36]/20 dark:bg-[#dfff36]/[.05]">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-600 text-white dark:bg-[#dfff36] dark:text-[#101217]"><CreditCard className="h-5 w-5" /></span><div><p className="text-sm font-black">Razorpay secure checkout</p><p className="mt-1 text-xs text-slate-500">UPI, cards, netbanking and wallets</p></div></div>
            {reservationFailed ? <Link to="/cart" className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-[#101217]">Review unavailable items</Link> : paid ? <Link to={`/orders/${activeOrder.id}`} onClick={() => { clearCart(); finishCheckout() }} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-black text-white"><CheckCircle2 className="h-4 w-4" /> Payment complete · Track order</Link> : <button type="button" onClick={pay} disabled={!reserved || !paymentReady || isPaying || paymentSubmitted} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#101217]">{(reserving || (reserved && !paymentReady) || isPaying || paymentSubmitted) ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}{reserving ? 'Reserving your items' : reserved && !paymentReady ? 'Preparing secure payment' : isPaying ? 'Processing payment' : paymentSubmitted ? 'Confirming your order' : `Pay securely · ₹${total.toLocaleString('en-IN')}`}</button>}
            {paymentError ? <p className="mt-3 text-center text-xs font-semibold text-red-600 dark:text-red-300">{paymentError}</p> : <p className="mt-3 text-center text-[11px] text-slate-500">Payment is processed by the server and confirmed through the order saga.</p>}
          </div>
          <div className="mt-6 flex flex-wrap gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-violet-600 dark:text-[#dfff36]" /> Encrypted checkout</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Server verification</span></div>
        </section>
        <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-[#dfff36]">Payable now</p><p className="mt-3 text-4xl font-black tracking-[-.05em]">₹{total.toLocaleString('en-IN')}</p><div className="mt-6 border-t border-white/10 pt-5"><p className="flex items-center gap-2 text-xs font-bold"><MapPin className="h-4 w-4 text-[#dfff36]" /> Delivering to</p><p className="mt-3 text-sm font-bold">{address.fullName}</p><p className="mt-2 text-xs leading-5 text-slate-400">{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} — {address.postalCode}<br />+91 {address.phone}</p></div><div className="mt-6 border-t border-white/10 pt-5 text-xs text-slate-500">{items.length} distinct {items.length === 1 ? 'product' : 'products'} · Free delivery</div></aside>
      </div>
    </div></main>
  )
}
