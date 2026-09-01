import { ChevronDown, SlidersHorizontal } from 'lucide-react'

const filters = ['Category', 'Rating 4★+', 'Color', 'Price', 'Sort: Featured']

export function StoreFilterHeader() {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/10 pt-4 dark:border-dark-border">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-body-sm font-bold text-white dark:bg-white dark:text-slate-950"><SlidersHorizontal className="h-3.5 w-3.5" /> Filters</button>
        {filters.map((filter) => <button key={filter} type="button" className="flex items-center gap-1 rounded-full border border-slate-900/10 bg-white px-3.5 py-2 text-body-sm text-slate-700 transition hover:border-violet-300 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200"><span>{filter}</span><ChevronDown className="h-3.5 w-3.5 text-slate-400" /></button>)}
      </div>
      <button type="button" className="text-body-sm font-bold text-violet-600">Clear all</button>
    </div>
  )
}
