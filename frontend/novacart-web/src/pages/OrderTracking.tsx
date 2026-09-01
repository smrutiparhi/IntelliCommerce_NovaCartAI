import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, MapPin, PackageSearch, ReceiptText, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { cancelOrder, getOrder } from '../api/orders'
import { OrderTrackingTimeline } from '../components/OrderTrackingTimeline'
import type { DeliveryAddress } from '../stores/checkout-store'

const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`
const dateTime = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))

export function OrderTrackingPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['order', id], queryFn: () => getOrder(id!), enabled: Boolean(id), refetchInterval: (state) => ['PENDING', 'AWAITING_PAYMENT', 'SHIPPED'].includes(state.state.data?.status ?? '') ? 4000 : false })
  const cancel = useMutation({ mutationFn: () => cancelOrder(id!), onSuccess: (order) => { queryClient.setQueryData(['order', id], order); void queryClient.invalidateQueries({ queryKey: ['orders'] }) } })

  if (query.isLoading) return <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-14"><div className="mx-auto max-w-5xl"><div className="h-8 w-40 animate-pulse rounded-full bg-black/[.05] dark:bg-white/[.05]" /><div className="mt-8 h-96 animate-pulse rounded-[2rem] bg-black/[.04] dark:bg-white/[.04]" /></div></main>
  if (!id || query.isError || !query.data) return <main className="flex min-h-[70vh] items-center bg-[var(--nc-bg)] px-5 py-16 text-center text-[var(--nc-text)]"><div className="mx-auto max-w-lg"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.6rem] bg-slate-950 text-white"><PackageSearch className="h-8 w-8 text-[#dfff36]" /></div><p className="nc-label mt-7">Order unavailable</p><h1 className="mt-4 text-h2">We couldn’t find this order.</h1><p className="mt-5 text-sm leading-7 text-slate-500">It may not belong to this account, or the Order Service is temporarily unavailable.</p><div className="mt-8 flex justify-center gap-3"><Link to="/orders" className="nc-secondary"><ArrowLeft className="h-4 w-4" /> Back to orders</Link><button onClick={() => query.refetch()} className="nc-primary"><RefreshCw className="h-4 w-4" /> Retry</button></div></div></main>

  const order = query.data
  let address: DeliveryAddress | null = null
  try { address = JSON.parse(order.shippingAddressJson) as DeliveryAddress } catch { address = null }
  const canCancel = ['PENDING', 'AWAITING_PAYMENT', 'CONFIRMED'].includes(order.status)

  return <main className="min-h-[70vh] bg-[var(--nc-bg)] px-5 py-12 text-[var(--nc-text)] sm:px-8 lg:py-16"><div className="mx-auto max-w-5xl">
    <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 dark:hover:text-[#dfff36]"><ArrowLeft className="h-4 w-4" /> All orders</Link>
    <header className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="nc-label">Live order tracking</p><h1 className="mt-3 text-h2">{order.orderNumber}</h1><p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-4 w-4" /> Placed {dateTime(order.createdAt)}</p></div><div className="text-left sm:text-right"><p className="text-xs text-slate-500">Order total</p><p className="mt-1 text-3xl font-black tracking-[-.04em]">{money(order.totalPaise)}</p></div></header>

    <section className="mt-8 rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-6 shadow-card dark:border-white/10 sm:p-8"><OrderTrackingTimeline sagaState={order.sagaState} status={order.status} /></section>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-5 dark:border-white/10 sm:p-7"><div className="flex items-center justify-between"><div><p className="nc-label">Inside your order</p><h2 className="mt-2 text-xl font-black">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</h2></div><ReceiptText className="h-5 w-5 text-violet-600 dark:text-[#dfff36]" /></div><div className="mt-6 divide-y divide-black/10 dark:divide-white/10">{order.items.map((item) => <article key={item.id ?? item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--nc-surface-raised)]"><img src={item.productImage || '/favicon.svg'} alt={item.productName} className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="text-sm font-black">{item.productName}</p><p className="mt-2 text-xs text-slate-500">Quantity {item.quantity}</p><p className="mt-2 text-sm font-bold">{money(item.subtotalPaise)}</p></div></article>)}</div></section>

      <aside className="space-y-5"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#dfff36]"><MapPin className="h-4 w-4" /> Delivery address</p>{address ? <div className="mt-5 text-sm"><p className="font-black">{address.fullName}</p><p className="mt-2 leading-6 text-slate-400">{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} — {address.postalCode}<br />+91 {address.phone}</p></div> : <p className="mt-4 text-xs text-slate-400">Address details are securely stored with this order.</p>}</section>{canCancel && <section className="rounded-[1.5rem] border border-black/10 bg-[var(--nc-surface)] p-5 dark:border-white/10"><p className="text-sm font-black">Changed your mind?</p><p className="mt-2 text-xs leading-5 text-slate-500">You can cancel before payment confirmation. Reserved stock will be released automatically.</p><button onClick={() => cancel.mutate()} disabled={cancel.isPending} className="mt-4 text-xs font-black text-rose-600 disabled:opacity-50">{cancel.isPending ? 'Cancelling…' : 'Cancel order'}</button>{cancel.isError && <p className="mt-2 text-xs text-rose-500">Cancellation could not be completed.</p>}</section>}</aside>
    </div>
  </div></main>
}
