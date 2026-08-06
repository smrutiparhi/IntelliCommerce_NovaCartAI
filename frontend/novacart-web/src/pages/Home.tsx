import { BrandFilterBar } from '../components/store/BrandFilterBar'
import { StoreFilterHeader } from '../components/store/StoreFilterHeader'
import { ProductCardGrid } from '../components/store/ProductCardGrid'
import { AIShoppingPanel } from '../components/ai/AIShoppingPanel'
import { useAIStore } from '../stores/ai-store'

export function HomePage() {
  const { isPanelOpen } = useAIStore()

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-dark-bg">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
        {/* Brand Bar */}
        <BrandFilterBar />

        {/* Filter Sub-header */}
        <StoreFilterHeader />

        {/* Main Dual-Pane Grid */}
        <div
          className={`mt-4 grid gap-6 transition-all duration-300 ${
            isPanelOpen ? 'lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_450px]' : 'grid-cols-1'
          }`}
        >
          {/* Left Column: Product Store Grid */}
          <div className="min-w-0">
            <ProductCardGrid />
          </div>

          {/* Right Column: AI Assistant Panel */}
          {isPanelOpen && (
            <div className="sticky top-20 h-[calc(100vh-6rem)] hidden lg:block">
              <AIShoppingPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
