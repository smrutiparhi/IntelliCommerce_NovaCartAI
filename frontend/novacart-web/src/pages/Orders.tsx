import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Clock3, PackageCheck, PackageOpen, ReceiptText, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getOrders } from '../api/orders'
import type { Order } from '../types/saga'

const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`
const date = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))

function statusMeta(order: Order) {
  if (order.status === 'CANCELLED') return { label: 'Cancelled', tone: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300', icon: XCircle }
  if (order.status === 'DELIVERED') return { label: 'Delivered', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300', icon: PackageCheck }
  if (order.status === 'SHIPPED') return { label: 'On the way', tone: 'bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300', icon: PackageCheck }
  if (order.status === 'CONFIRMED') return { label: 'Confirmed', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300', icon: ShieldCheck }
  return { label: order.status === 'AWAITING_PAYMENT' ? 'Awaiting payment' : 'Processing', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300', icon: Clock3 }
}

export function OrdersPage() {
  const query = useQuery({ queryKey: ['orders'], queryFn: () => getOrders(0, 50), refetchInterval: 5000 })
  const orders = query.data?.content ?? []

  return (
    <main className="min-h-[70vh] bg-[var(--nc-bg)] py-12 text-[var(--nc-text)] lg:py-18"><div className="nc-shell">
      <header className="flex flex-col justify-between gap-5 border-b border-black/10 pb-10 dark:border-white/10 sm:flex-row sm:items-end"><div><p className="nc-label">Purchase history</p><h1 className="mt-4 text-h1">Your orders</h1><p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">Track active purchases and revisit previous orders from one calm, private space.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-[var(--nc-surface)] px-4 py-2 text-xs font-bold dark:border-white/10"><ReceiptText className="h-4 w-4 text-violet-600 dark:text-[#dfff36]" /> {query.isLoading ? 'Loading' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}</span></header>

      {query.isLoading && <section className="mt-10 grid gap-5 lg:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-[2rem] bg-black/[.04] dark:bg-white/[.04]" />)}</section>}

      {query.isError && <section className="mt-10 rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-16 text-center dark:border-rose-400/20 dark:bg-rose-400/[.06]"><RefreshCw className="mx-auto h-8 w-8 text-rose-500" /><h2 className="mt-5 text-2xl font-black">We couldn’t load your orders.</h2><p className="mt-3 text-sm text-slate-500">Your history is safe. Check the connection and try again.</p><button onClick={() => query.refetch()} className="nc-primary mt-7">Try again</button></section>}

      {!query.isLoading && !query.isError && orders.length === 0 && <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] px-6 py-20 text-center shadow-card dark:border-white/10 sm:px-10 sm:py-24"><div className="absolute left-[20%] top-[-8rem] h-64 w-64 rounded-full bg-violet-500/10 blur-[110px]" /><div className="relative mx-auto max-w-lg"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.6rem] bg-slate-950 text-white"><PackageOpen className="h-8 w-8 text-[#dfff36]" /></div><p className="nc-label mt-7">No orders yet</p><h2 className="mt-4 text-h2">Your first order will appear here.</h2><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-500">Browse the catalogue and complete checkout to begin your NovaCart order history.</p><Link to="/categories" className="nc-primary mt-8">Explore categories <ArrowRight className="h-4 w-4" /></Link></div></section>}

      {orders.length > 0 && <section className="mt-10 grid gap-5 lg:grid-cols-2">{orders.map((order) => {
        const meta = statusMeta(order); const StatusIcon = meta.icon
        return <article key={order.id} className="group rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-5 shadow-card transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="nc-label">{order.orderNumber}</p><p className="mt-2 text-xs text-slate-500">Placed {date(order.createdAt)}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${meta.tone}`}><StatusIcon className="h-3.5 w-3.5" /> {meta.label}</span></div><div className="mt-6 flex -space-x-3">{order.items.slice(0, 4).map((item) => <div key={item.id ?? item.productId} className="h-16 w-16 overflow-hidden rounded-2xl border-4 border-[var(--nc-surface)] bg-[var(--nc-surface-raised)]"><img src={item.productImage || '/favicon.svg'} alt="" className="h-full w-full object-cover" /></div>)}{order.items.length > 4 && <span className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-[var(--nc-surface)] bg-slate-950 text-xs font-black text-white">+{order.items.length - 4}</span>}</div><div className="mt-6 flex items-end justify-between gap-5 border-t border-black/10 pt-5 dark:border-white/10"><div><p className="text-xs text-slate-500">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p><p className="mt-1 text-xl font-black">{money(order.totalPaise)}</p></div><Link to={`/orders/${order.id}`} className="inline-flex items-center gap-2 text-sm font-black text-violet-600 dark:text-[#dfff36]">Track order <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></div></article>
      })}</section>}

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-black/10 bg-[var(--nc-surface)] px-5 py-4 text-xs text-slate-500 dark:border-white/10"><ShieldCheck className="h-4 w-4 shrink-0 text-violet-600 dark:text-[#dfff36]" /> Order history is tied securely to your signed-in account.</div>
    </div></main>
  )
}
