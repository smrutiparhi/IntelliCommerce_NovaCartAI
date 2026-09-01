import { cn } from '../../lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-white/[.05]', className)} />
}

/** A generic page skeleton matching a header + content-block layout — used as the
 * placeholder for routes whose real page isn't built yet (per-slice, see TEAM.md). */
export function PageSkeleton({ title }: { title: string }) {
  return (
    <div className="mx-auto min-h-[70vh] max-w-[1280px] bg-[var(--nc-bg)] px-6 py-12 text-[var(--nc-text)]">
      <Skeleton className="mb-6 h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
      <p className="mt-8 text-body-sm text-slate-500">{title} — this space is being prepared.</p>
    </div>
  )
}
