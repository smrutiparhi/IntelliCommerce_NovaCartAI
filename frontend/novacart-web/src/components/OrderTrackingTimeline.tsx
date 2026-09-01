import { Check, Circle, CreditCard, PackageCheck, ShieldCheck, Truck, XCircle } from 'lucide-react'
import type { OrderStatus, SagaState } from '../types/saga'

interface Props { sagaState: SagaState; status: OrderStatus }

export function OrderTrackingTimeline({ sagaState, status }: Props) {
  const failed = status === 'CANCELLED'
  const stockDone = ['STOCK_RESERVED', 'PAYMENT_SUCCESSFUL', 'ORDER_CONFIRMED'].includes(sagaState) || ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(status)
  const paymentDone = ['PAYMENT_SUCCESSFUL', 'ORDER_CONFIRMED'].includes(sagaState) || ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(status)
  const steps = [
    { label: 'Order placed', note: 'We received your order', icon: PackageCheck, done: true },
    { label: 'Stock secured', note: stockDone ? 'Your items are reserved' : 'Checking item availability', icon: ShieldCheck, done: stockDone },
    { label: 'Payment confirmed', note: paymentDone ? 'Payment verification complete' : 'Waiting for secure payment', icon: CreditCard, done: paymentDone },
    { label: 'Shipped', note: status === 'SHIPPED' || status === 'DELIVERED' ? 'Your parcel is on the way' : 'Preparing for dispatch', icon: Truck, done: status === 'SHIPPED' || status === 'DELIVERED' },
    { label: 'Delivered', note: status === 'DELIVERED' ? 'Delivered successfully' : 'Delivery confirmation pending', icon: Check, done: status === 'DELIVERED' },
  ]

  if (failed) return <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 dark:border-rose-400/20 dark:bg-rose-400/[.06]"><div className="flex items-start gap-3"><XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" /><div><p className="text-sm font-black text-rose-700 dark:text-rose-300">This order was cancelled</p><p className="mt-1 text-xs leading-5 text-slate-500">Any reserved inventory has been released. If a payment was captured, the refund workflow will appear here.</p></div></div></div>

  const firstPending = steps.findIndex((step) => !step.done)
  return <div className="grid gap-0 sm:grid-cols-5">{steps.map((step, index) => { const Icon = step.icon; const active = index === firstPending; return <div key={step.label} className="relative flex gap-4 pb-7 sm:block sm:pb-0 sm:text-center"><div className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 ${step.done ? 'border-violet-600 bg-violet-600 text-white dark:border-[#dfff36] dark:bg-[#dfff36] dark:text-[#101217]' : active ? 'border-violet-400 bg-[var(--nc-surface)] text-violet-600 dark:border-[#dfff36]/60 dark:text-[#dfff36]' : 'border-black/10 bg-[var(--nc-surface-raised)] text-slate-400 dark:border-white/10'}`}>{step.done ? <Check className="h-4 w-4" /> : active ? <Icon className="h-4 w-4" /> : <Circle className="h-3 w-3" />}</div>{index < steps.length - 1 && <span className={`absolute left-[21px] top-11 h-[calc(100%-2.75rem)] w-0.5 sm:left-[calc(50%+22px)] sm:top-[21px] sm:h-0.5 sm:w-[calc(100%-44px)] ${step.done ? 'bg-violet-600 dark:bg-[#dfff36]' : 'bg-black/10 dark:bg-white/10'}`} />}<div className="pt-1 sm:mt-4 sm:pt-0"><p className="text-xs font-black">{step.label}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{step.note}</p></div></div> })}</div>
}
