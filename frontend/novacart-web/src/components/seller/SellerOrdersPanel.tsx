import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LoaderCircle, PackageCheck, Search, ShoppingBag, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FulfillmentStatus, Order, OrderStatus } from '../../types/saga'

const statuses: Array<'ALL' | OrderStatus> = ['ALL', 'PENDING', 'AWAITING_PAYMENT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const money = (paise: number) => `₹${Math.round(paise / 100).toLocaleString('en-IN')}`
type SellerAction = Extract<FulfillmentStatus, 'SHIPPED' | 'DELIVERED'>
type Props = { orders: Order[]; sellerId: string; loading: boolean; updatingOrderId?: string; onUpdate: (orderId: string, status: SellerAction) => void }

export function SellerOrdersPanel({ orders, sellerId, loading, updatingOrderId, onUpdate }: Props) {
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const filtered = useMemo(() => orders.filter((order) => {
    const sellerItems = order.items.filter((item) => item.sellerId === sellerId)
    const text = `${order.orderNumber} ${sellerItems.map((item) => item.productName).join(' ')}`.toLowerCase()
    return (status === 'ALL' || order.status === status) && text.includes(query.trim().toLowerCase())
  }), [orders, query, sellerId, status])

  return <section className="mt-10">
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="nc-label">Order workspace</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Manage every sale.</h2><p className="mt-2 text-sm text-slate-500">Search orders and fulfil only the products belonging to your store.</p></div><label className="flex h-11 min-w-64 items-center gap-2 rounded-full border border-black/10 bg-[var(--nc-surface)] px-4 dark:border-white/10"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order or product" className="w-full bg-transparent text-xs outline-none" /></label></div>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{statuses.map((value) => <button key={value} onClick={() => setStatus(value)} className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wide transition ${status === value ? 'bg-slate-950 text-white dark:bg-[#dfff36] dark:text-slate-950' : 'border border-black/10 bg-[var(--nc-surface)] text-slate-500 dark:border-white/10'}`}>{value.replace('_', ' ')}</button>)}</div>
    <div className="mt-4 overflow-hidden rounded-[1.7rem] border border-black/10 bg-[var(--nc-surface)] dark:border-white/10">{loading ? <p className="p-8 text-sm text-slate-500">Loading order workspace…</p> : filtered.length === 0 ? <div className="p-12 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-4 text-sm font-black">No matching orders</p><p className="mt-2 text-xs text-slate-500">Try another status or search term.</p></div> : filtered.map((order) => {
      const sellerItems = order.items.filter((item) => item.sellerId === sellerId)
      const total = sellerItems.reduce((sum, item) => sum + item.subtotalPaise, 0)
      const open = expanded === order.id
      const fulfillment = sellerItems[0]?.fulfillmentStatus ?? (order.status === 'CONFIRMED' ? 'PROCESSING' : order.status)
      const nextStatus: SellerAction | null = fulfillment === 'PROCESSING' ? 'SHIPPED' : fulfillment === 'SHIPPED' ? 'DELIVERED' : null
      return <article key={order.id} className="border-b border-black/[.07] last:border-0 dark:border-white/[.07]">
        <button onClick={() => setExpanded(open ? null : order.id)} className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black">{order.orderNumber}</p><StatusBadge status={order.status} /></div><p className="mt-2 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {sellerItems.length} listing(s)</p></div><div className="sm:text-right"><p className="text-sm font-black">{money(total)}</p><p className="mt-1 text-[10px] text-slate-500">Your order value</p></div><ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} /></button>
        <AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border-t border-black/[.07] bg-black/[.018] p-5 dark:border-white/[.07] dark:bg-white/[.018]"><div className="grid gap-3 md:grid-cols-2">{sellerItems.map((item) => <div key={`${order.id}-${item.productId}`} className="flex items-center gap-4 rounded-2xl border border-black/[.07] bg-[var(--nc-surface)] p-3 dark:border-white/[.07]"><div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-white/[.05]">{item.productImage ? <img src={item.productImage} alt="" className="h-full w-full object-cover" /> : <PackageCheck className="h-5 w-5 text-slate-400" />}</div><div className="min-w-0"><p className="truncate text-xs font-black">{item.productName}</p><p className="mt-1 text-[10px] text-slate-500">Qty {item.quantity} · {money(item.unitPricePaise)} each</p><p className="mt-2 text-xs font-black">{money(item.subtotalPaise)}</p></div></div>)}</div><div className="mt-4 flex flex-col gap-3 rounded-2xl border border-black/[.07] bg-[var(--nc-surface)] p-4 dark:border-white/[.07] sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Your fulfilment status</p><p className="mt-1 text-sm font-black">{String(fulfillment).replace('_', ' ')}</p></div>{nextStatus && <button disabled={updatingOrderId === order.id} onClick={() => onUpdate(order.id, nextStatus)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-[#dfff36] dark:text-slate-950">{updatingOrderId === order.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}{nextStatus === 'SHIPPED' ? 'Mark as shipped' : 'Mark as delivered'}</button>}</div></div></motion.div>}</AnimatePresence>
      </article>
    })}</div>
  </section>
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === 'CANCELLED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300' : status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-violet-100 text-violet-700 dark:bg-[#dfff36]/10 dark:text-[#dfff36]'
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${tone}`}>{status.replace('_', ' ')}</span>
}
