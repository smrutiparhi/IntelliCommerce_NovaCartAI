import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, Bot, Database, GitCompareArrows, LoaderCircle, RefreshCw, SearchX, ShieldCheck, Sparkles, Target, Wrench } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { getAiAnalytics, getRagStatus, reindexRag } from '../../api/ai'
import { useAuthStore } from '../../stores/auth-store'

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })

export function AnalyticsDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const analytics = useQuery({ queryKey: ['ai-analytics'], queryFn: getAiAnalytics, refetchInterval: 30_000 })
  const rag = useQuery({ queryKey: ['rag-status'], queryFn: getRagStatus, refetchInterval: 30_000 })
  const reindex = useMutation({ mutationFn: reindexRag, onSuccess: (status) => queryClient.setQueryData(['rag-status'], status) })
  if (!user?.roles.includes('ROLE_ADMIN')) return <Navigate to="/home" replace />

  const data = analytics.data
  const groundedRate = Math.round((data?.groundingRate ?? 0) * 100)
  const toolActivity = [
    { label: 'Order tracking', value: data?.orderTrackingCalls ?? 0, icon: Activity },
    { label: 'Product comparisons', value: data?.comparisonCalls ?? 0, icon: GitCompareArrows },
    { label: 'Cancel proposals', value: data?.cancellationProposals ?? 0, icon: Wrench },
    { label: 'Confirmed cancellations', value: data?.confirmedCancellations ?? 0, icon: ShieldCheck },
  ]
  const toolTotal = Math.max(1, toolActivity.reduce((sum, item) => sum + item.value, 0))
  const ratingTotal = (data?.helpfulRatings ?? 0) + (data?.unhelpfulRatings ?? 0)
  const satisfaction = ratingTotal ? Math.round((data?.helpfulRatings ?? 0) / ratingTotal * 100) : 0

  return <main id="main-content" className="min-h-[78vh] bg-[var(--nc-bg)] px-5 py-10 text-[var(--nc-text)] sm:px-8 lg:py-14">
    <div className="mx-auto max-w-shell">
      <header className="overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-7 shadow-card dark:border-white/10 sm:p-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div><p className="nc-label flex items-center gap-2"><Sparkles size={14} /> Nova intelligence</p><h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.055em] sm:text-6xl">Grounded answers.<br /><span className="text-violet-600 dark:text-[#dfff36]">Measured clearly.</span></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">A live view of catalogue grounding and the customer actions Nova performs. Metrics refresh every 30 seconds.</p></div>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[.07] dark:text-emerald-300"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /> Live telemetry</div>
        </div>
      </header>

      {analytics.isError && <p role="alert" className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[.07] dark:text-rose-300">AI analytics could not be loaded. Confirm the AI service is running and your account has the administrator role.</p>}

      <section className="mt-6 flex flex-col gap-5 rounded-[1.5rem] border border-black/10 bg-[var(--nc-surface)] p-5 shadow-card dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-[#dfff36]/10 dark:text-[#dfff36]"><Database size={20} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">RAG knowledge index</h2><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${rag.data?.openAiEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'}`}>{rag.data?.openAiEnabled ? 'OpenAI live' : 'Local fallback'}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{rag.data?.chunks ?? 0} grounded chunks · {rag.data?.embeddingModel ?? 'Loading model'} · {rag.data?.lastIndexedAt ? `Updated ${new Date(rag.data.lastIndexedAt).toLocaleString('en-IN')}` : 'Waiting for first index'}</p>{rag.data?.lastError && <p className="mt-1 text-xs font-bold text-rose-500">{rag.data.lastError}</p>}</div></div>
        <button type="button" disabled={reindex.isPending || rag.data?.indexing} onClick={() => reindex.mutate()} className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-[#dfff36] dark:text-slate-950">{reindex.isPending || rag.data?.indexing ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}Rebuild index</button>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="AI performance summary">
        {[
          { label: 'Questions answered', value: compact.format(data?.queries ?? 0), note: 'Total assistant requests', icon: Bot },
          { label: 'Grounding rate', value: `${groundedRate}%`, note: 'Answers backed by products', icon: Target },
          { label: 'Grounded answers', value: compact.format(data?.groundedResponses ?? 0), note: 'With catalogue evidence', icon: ShieldCheck },
          { label: 'No-match queries', value: compact.format(data?.emptyRetrievals ?? 0), note: 'Safely returned no result', icon: SearchX },
        ].map(({ label, value, note, icon: Icon }, index) => <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} key={label} className="rounded-[1.5rem] border border-black/10 bg-[var(--nc-surface)] p-6 shadow-card dark:border-white/10"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-[#dfff36]/10 dark:text-[#dfff36]"><Icon size={20} /></span><p className="mt-7 text-4xl font-black tracking-[-.05em]">{analytics.isLoading ? '—' : value}</p><p className="mt-2 text-sm font-black">{label}</p><p className="mt-1 text-xs text-slate-500">{note}</p></motion.article>)}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <article className="rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-7 shadow-card dark:border-white/10 sm:p-8"><p className="nc-label">Agent tools</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Actions Nova performed</h2><div className="mt-8 space-y-6">{toolActivity.map(({ label, value, icon: Icon }) => { const width = Math.max(value ? 8 : 0, Math.round(value / toolTotal * 100)); return <div key={label}><div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="flex items-center gap-2 font-bold"><Icon size={15} className="text-violet-600 dark:text-[#dfff36]" />{label}</span><strong>{value}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-[#dfff36] dark:to-emerald-400" /></div></div>})}</div></article>
        <article className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-card dark:bg-[#dfff36] dark:text-slate-950 sm:p-8"><p className="text-[11px] font-black uppercase tracking-[.18em] opacity-60">Retrieval depth</p><p className="mt-5 text-6xl font-black tracking-[-.06em]">{(data?.averageRetrievedProducts ?? 0).toFixed(1)}</p><p className="mt-2 text-sm font-bold">products cited per question</p><div className="mt-10 border-t border-white/15 pt-6 text-sm leading-6 opacity-70 dark:border-black/15">Higher isn’t always better. Nova aims for a small, relevant evidence set so answers stay focused and traceable.</div></article>
      </section>
      <section className="mt-6 rounded-[2rem] border border-black/10 bg-[var(--nc-surface)] p-7 shadow-card dark:border-white/10 sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="nc-label">Customer signal</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Response satisfaction</h2><p className="mt-2 text-sm text-slate-500">{ratingTotal} rated response{ratingTotal === 1 ? '' : 's'} collected.</p></div><p className="text-5xl font-black tracking-[-.05em] text-violet-600 dark:text-[#dfff36]">{satisfaction}%</p></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${satisfaction}%` }} className="h-full rounded-full bg-emerald-500" /></div></section>
    </div>
  </main>
}
