import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react'
import { PRODUCTS, type StoreProduct } from '../../data/store-products'
import { useAIStore } from '../../stores/ai-store'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

export function ProductCardGrid() {
  const { searchQuery, selectedBrand } = useAIStore()

  // Filter products based on search query or selected brand
  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedBrand && p.brand !== selectedBrand) return false

    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()

    if (q.includes('denim')) {
      return p.category === 'Denim Jackets' || p.tags.includes('denim')
    }
    if (q.includes('floral')) {
      return p.tags.includes('floral') || p.category === 'Puffer Jackets'
    }
    if (q.includes('puffer') || q.includes('patterned') || q.includes('multicolor')) {
      return p.category === 'Puffer Jackets' || p.tags.includes('multicolor')
    }

    return (
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
    )
  })

  return (
    <div className="space-y-4">
      {/* Store Header & Result count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-bold text-slate-900 dark:text-white">Store</h2>
          <span className="text-slate-400 font-normal text-body-sm">&gt;</span>
          <span className="text-body-sm font-semibold text-slate-600 dark:text-slate-300">
            Result ({filteredProducts.length})
          </span>
          {searchQuery && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">
              <Sparkles className="h-3 w-3" /> "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* Grid of cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={searchQuery + (selectedBrand || '')}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-dark-border">
          <Sparkles className="h-8 w-8 text-primary-500 mb-2 animate-bounce" />
          <p className="text-body-lg font-semibold text-slate-700 dark:text-slate-200">No products added yet</p>
          <p className="mt-1 text-body-sm text-slate-400 max-w-sm">
            Real products will automatically display here once connected to your backend product API and AI services.
          </p>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-lg dark:border-dark-border dark:bg-dark-surface"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-slate-100 dark:bg-dark-bg">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Brand badge top left */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-dark-surface/90 dark:text-slate-200">
          <span>{product.brand}</span>
        </div>

        {/* Favorite button top right */}
        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 backdrop-blur transition-transform hover:scale-110 hover:bg-white dark:bg-dark-surface/80 dark:text-slate-300"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Add overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900/90 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-primary-600 transition-colors shadow-md"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-2 text-body-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{product.rating}</span>
            <span className="text-xs text-slate-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2.5 dark:border-dark-border/60">
          <span className="text-body font-bold text-slate-900 dark:text-white">
            {product.priceAED.toFixed(2)} <span className="text-xs font-medium text-slate-500">AED</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
