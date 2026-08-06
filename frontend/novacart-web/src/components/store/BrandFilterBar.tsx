import { motion } from 'framer-motion'
import { BRANDS } from '../../data/store-products'
import { useAIStore } from '../../stores/ai-store'

export function BrandFilterBar() {
  const { selectedBrand, setSelectedBrand } = useAIStore()

  if (BRANDS.length === 0) return null

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 custom-scrollbar">
      {BRANDS.map((brand) => {
        const isSelected = selectedBrand === brand.name
        return (
          <motion.div
            key={brand.name}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedBrand(isSelected ? null : brand.name)}
            className={`flex shrink-0 cursor-pointer items-center justify-between gap-3 rounded-full border px-3.5 py-1.5 transition-all shadow-sm ${
              isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-dark-border dark:bg-dark-surface text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <img
                src={brand.avatar}
                alt={brand.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-body-sm font-semibold leading-tight">{brand.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{brand.subtitle}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedBrand(brand.name)
              }}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-primary-600 hover:text-white dark:bg-dark-border dark:text-slate-300 dark:hover:bg-primary-600 dark:hover:text-white transition-colors"
            >
              Visit shop
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
