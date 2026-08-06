import { ChevronDown, SlidersHorizontal } from 'lucide-react'

const filterItems = [
  { label: 'Category', value: 'All' },
  { label: 'Rating', value: '4★+' },
  { label: 'Gender', value: 'All' },
  { label: 'Size', value: 'All' },
  { label: 'Color', value: 'All' },
  { label: 'Price', value: 'All' },
  { label: 'Sort by', value: 'Featured' },
]

export function StoreFilterHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-200/80 dark:border-dark-border mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-body-sm font-medium text-slate-700 hover:border-slate-300 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
          Filters
        </button>

        {filterItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-body-sm text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200 dark:hover:bg-dark-bg transition-colors"
          >
            <span className="font-normal">{item.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        ))}
      </div>

      <a
        href="#"
        className="text-body-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
      >
        View All &gt;
      </a>
    </div>
  )
}
