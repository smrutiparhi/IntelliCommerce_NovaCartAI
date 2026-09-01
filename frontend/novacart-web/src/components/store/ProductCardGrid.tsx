import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Heart, ShoppingBag, Star, Sparkles } from 'lucide-react'
import type { StoreProduct } from '../../data/store-products'
import { useAIStore } from '../../stores/ai-store'
import { useCommerceStore } from '../../stores/commerce-store'
import { QuickViewModal } from '../product/QuickViewModal'
import { BrandFilterBar } from './BrandFilterBar'
import { useCatalogue } from '../../hooks/useCatalogue'

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

export function ProductCardGrid({ query }: { query?: string } = {}) {
  const { searchQuery, selectedBrand } = useAIStore()
  const { data: catalogue, isLoading } = useCatalogue()
  const products = catalogue?.products ?? []
  const effectiveQuery = query ?? searchQuery
  const effectiveBrand = query === undefined ? selectedBrand : null

  // Filter products based on search query or selected brand
  const filteredProducts = products.filter((p) => {
    if (effectiveBrand && p.brand !== effectiveBrand) return false

    if (!effectiveQuery) return true
    const q = effectiveQuery.toLowerCase()
    if (q === 'deals') return Boolean(p.originalPriceINR)
    if (q === 'trending') return ['trending', 'bestseller', 'popular'].some((label) => p.badge?.toLowerCase().includes(label))
    if (q === 'new') return p.badge?.toLowerCase().includes('new') ?? false
    const haystack = [p.title, p.brand, p.category, p.badge ?? '', ...p.tags].join(' ').toLowerCase()
    const terms = q.split(/\s+/).filter((term) => term.length > 2)

    return haystack.includes(q) || terms.some((term) => haystack.includes(term))
  })

  return (
    <div className="space-y-4">
      {/* Store Header & Result count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-semibold tracking-[-.04em] text-slate-950 dark:text-white">Live catalogue</h2>
          <span className="text-body-sm font-semibold text-slate-600 dark:text-slate-300">{isLoading ? 'Loading…' : `${filteredProducts.length} products`}</span>
          {catalogue?.source === 'api' && <span className="hidden rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300 sm:inline-flex">Live API</span>}
          {effectiveQuery && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">
              <Sparkles className="h-3 w-3" /> "{effectiveQuery}"
            </span>
          )}
        </div>
      </div>
      {query === undefined && <BrandFilterBar />}

      {/* Grid of cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={effectiveQuery + (effectiveBrand || '')}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[.02] p-10 text-center">
          <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[.04]"><Sparkles className="h-5 w-5 text-indigo-300" /></span>
          <p className="text-body-lg font-semibold text-slate-950 dark:text-white">No exact match yet.</p>
          <p className="mt-2 max-w-sm text-body-sm text-slate-500">
            Try a category, product type, or brand—such as audio, sneakers, coffee, or Nova Labs.
          </p>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: StoreProduct }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const isSaved = useCommerceStore((state) => state.wishlist.includes(product.id))
  const cartQuantity = useCommerceStore((state) => state.cart[product.id] ?? 0)
  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist)
  const addToCart = useCommerceStore((state) => state.addToCart)

  return (
    <>
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white p-2 shadow-[0_14px_40px_rgba(15,23,42,.06)] transition-all hover:shadow-xl dark:border-dark-border dark:bg-dark-surface"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/4.25] w-full overflow-hidden rounded-[1.15rem] bg-slate-100 dark:bg-dark-bg">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/favicon.svg'
            event.currentTarget.classList.add('object-contain', 'p-16')
          }}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Brand badge top left */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur dark:bg-dark-surface/90 dark:text-slate-200">
          <span>{product.brand}</span>
        </div>

        {/* Favorite button top right */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isSaved ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          aria-pressed={isSaved}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:scale-105 ${isSaved ? 'text-rose-500' : 'text-slate-600'}`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {product.badge && <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur group-hover:opacity-0">{product.badge}</span>}

        {/* Quick Add overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" onClick={() => setQuickViewOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-950 shadow-md" aria-label={`Quick view ${product.title}`}><Eye className="h-4 w-4" /></button>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            aria-label={`Add ${product.title} to cart`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950/95 py-2.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-indigo-500 shadow-md"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> {cartQuantity > 0 ? `${cartQuantity} in cart` : 'Quick add'}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-4">
        <div>
          <h3 className="line-clamp-2 text-body-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"><Link to={`/products/${product.id}`}>{product.title}</Link></h3>

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
        <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-dark-border/60">
          <div className="flex items-baseline gap-2"><span className="text-body font-bold text-slate-900 dark:text-white">₹{product.priceINR.toLocaleString('en-IN')}</span>{product.originalPriceINR && <span className="text-xs text-slate-500 line-through">₹{product.originalPriceINR.toLocaleString('en-IN')}</span>}</div>
          {product.delivery && <p className="mt-1 text-[10px] text-slate-500">{product.delivery}</p>}
        </div>
      </div>
    </motion.div>
    <QuickViewModal product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  )
}
