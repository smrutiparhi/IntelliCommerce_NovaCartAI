import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, MessageSquareText, Star } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProductReviews, saveProductReview, type ProductReview } from '../../api/products'
import { useAuthStore } from '../../stores/auth-store'

export function ReviewPanel({ productId }: { productId: string }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getProductReviews(productId).then((items) => active && setReviews(items)).catch(() => active && setError('Reviews are temporarily unavailable.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [productId])

  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews])
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setSaved(false)
    try {
      const review = await saveProductReview(productId, { rating, title, comment })
      setReviews((items) => [review, ...items.filter((item) => item.userId !== review.userId)])
      setTitle(''); setComment(''); setSaved(true)
    } catch { setError('We could not save your review. Please try again.') } finally { setSaving(false) }
  }

  return <section className="border-t border-black/10 py-16 dark:border-white/10 lg:py-20"><div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
    <div><p className="nc-label">Customer reviews</p><h2 className="mt-4 text-h2">Real opinions,<br />better choices.</h2><div className="mt-7 flex items-end gap-4"><span className="text-5xl font-semibold tracking-[-.06em]">{reviews.length ? average.toFixed(1) : '—'}</span><div className="pb-1"><Stars value={Math.round(average)} /><p className="mt-2 text-xs text-slate-500">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p></div></div></div>
    <div className="space-y-4">
      {isAuthenticated ? <form onSubmit={submit} className="rounded-[1.8rem] border border-black/10 bg-[var(--nc-surface)] p-6 dark:border-white/10 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-semibold">Share your experience</h3><p className="mt-1 text-xs text-slate-500">Your latest review replaces an earlier one.</p></div><div className="flex gap-1">{[1,2,3,4,5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} stars`} className="rounded-full p-1"><Star className={`h-5 w-5 ${value <= rating ? 'fill-[#dfff36] text-[#9bac00] dark:text-[#dfff36]' : 'text-slate-300 dark:text-slate-700'}`} /></button>)}</div></div><div className="mt-5 grid gap-3"><input required maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Review title" className="h-12 rounded-2xl border border-black/10 bg-transparent px-4 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:focus:border-[#dfff36]" /><textarea required maxLength={1000} rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did you like? What should other shoppers know?" className="resize-none rounded-2xl border border-black/10 bg-transparent p-4 text-sm leading-6 outline-none focus:border-violet-500 dark:border-white/10 dark:focus:border-[#dfff36]" /></div><div className="mt-4 flex items-center justify-between gap-4"><div className="text-xs">{saved && <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Review saved</span>}{error && <span className="text-rose-500">{error}</span>}</div><button disabled={saving} className="nc-primary min-w-32 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />} Publish</button></div></form> : <div className="rounded-[1.8rem] border border-dashed border-black/15 bg-[var(--nc-surface)] p-7 dark:border-white/15"><h3 className="font-semibold">Bought something you love?</h3><p className="mt-2 text-sm leading-6 text-slate-500">Sign in to rate this product and help the next shopper.</p><Link to="/login" className="nc-secondary mt-5">Sign in to review</Link></div>}
      {loading ? <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading reviews</div> : reviews.length === 0 ? <div className="rounded-[1.8rem] border border-black/10 p-8 text-sm text-slate-500 dark:border-white/10">No reviews yet. Be the first to share an honest opinion.</div> : reviews.map((review, index) => <motion.article key={review.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .04 }} className="rounded-[1.8rem] border border-black/10 bg-[var(--nc-surface)] p-6 dark:border-white/10"><div className="flex items-start justify-between gap-5"><div><Stars value={review.rating} /><h3 className="mt-3 font-semibold">{review.title}</h3></div><time className="shrink-0 text-[10px] uppercase tracking-wider text-slate-500">{new Date(review.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time></div><p className="mt-3 text-sm leading-7 text-slate-500">{review.comment}</p><p className="mt-4 text-xs font-semibold">{review.customerName}{review.verifiedPurchase && <span className="ml-2 text-emerald-600 dark:text-emerald-400">Verified purchase</span>}</p></motion.article>)}
    </div>
  </div></section>
}

function Stars({ value }: { value: number }) { return <div className="flex gap-1" aria-label={`${value} out of 5 stars`}>{[1,2,3,4,5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= value ? 'fill-[#dfff36] text-[#9bac00] dark:text-[#dfff36]' : 'text-slate-300 dark:text-slate-700'}`} />)}</div> }
