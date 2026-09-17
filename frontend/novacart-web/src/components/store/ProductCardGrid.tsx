import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, Check, Eye, Heart, Plus, Search, SlidersHorizontal, Star } from 'lucide-react'
import type { StoreProduct } from '../../data/store-products'
import { useAIStore } from '../../stores/ai-store'
import { useCommerceStore } from '../../stores/commerce-store'
import { replaceBrokenProductImage } from '../../lib/product-image'
import { QuickViewModal } from '../product/QuickViewModal'
import { useAvailability, useCatalogue } from '../../hooks/useCatalogue'

const categories = ['All finds', 'Technology', 'Audio', 'Fashion', 'Home', 'Beauty']
type Sort = 'featured' | 'price-low' | 'price-high' | 'rating'

export function ProductCardGrid({ query }: { query?: string } = {}) {
  const { searchQuery, selectedBrand, setSelectedBrand } = useAIStore()
  const { data: catalogue, isLoading } = useCatalogue()
  const { data: availability } = useAvailability()
  const [category, setCategory] = useState('All finds')
  const [sort, setSort] = useState<Sort>('featured')
  const [visibleCount, setVisibleCount] = useState(12)
  const effectiveQuery = query ?? searchQuery
  const effectiveBrand = query === undefined ? selectedBrand : null
  const brands = useMemo(() => [...new Set(catalogue?.products.map((p) => p.brand) ?? [])].sort(), [catalogue])
  useEffect(() => { setVisibleCount(12) }, [effectiveQuery, effectiveBrand, category, sort])
  const products = (catalogue?.products ?? []).filter((p) => {
    if (effectiveBrand && p.brand !== effectiveBrand) return false
    if (category !== 'All finds' && p.category !== category) return false
    if (!effectiveQuery) return true
    const q = effectiveQuery.toLowerCase()
    if (q === 'deals') return Boolean(p.originalPriceINR && p.originalPriceINR > p.priceINR)
    if (q === 'trending') return ['trending', 'bestseller', 'popular'].some((label) => p.badge?.toLowerCase().includes(label))
    if (q === 'new') return p.badge?.toLowerCase().includes('new') ?? false
    const haystack = [p.title, p.brand, p.category, p.badge ?? '', ...p.tags].join(' ').toLowerCase()
    const terms = q.split(/\s+/).filter((term) => term.length > 2)
    return haystack.includes(q) || terms.some((term) => haystack.includes(term))
  }).sort((a,b) => sort === 'price-low' ? a.priceINR - b.priceINR : sort === 'price-high' ? b.priceINR - a.priceINR : sort === 'rating' ? b.rating - a.rating : 0)

  return <div>
    <div className="nc-catalogue-toolbar">
      <div className="nc-filter-pills" role="group" aria-label="Filter by category">{categories.map((value) => <button key={value} onClick={() => setCategory(value)} aria-pressed={category === value}>{value}</button>)}</div>
      <label className="nc-sort"><SlidersHorizontal size={13} /><span className="sr-only">Sort products</span><select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label>
    </div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="nc-muted text-[10px]" aria-live="polite">{isLoading ? 'Finding the good stuff…' : `${products.length} finds${effectiveQuery ? ` for “${effectiveQuery}”` : ' for your everyday'}`}</p>
      {query === undefined && <label className="nc-sort"><span>Brand</span><select aria-label="Filter by brand" value={effectiveBrand ?? ''} onChange={(event) => setSelectedBrand(event.target.value || null)}><option value="">All brands</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>}
    </div>
    {isLoading ? <div className="nc-products-grid" aria-label="Loading products" aria-busy="true">{Array.from({length: 8}, (_, i) => <div key={i} className="animate-pulse"><div className="nc-product-image" /><div className="mt-4 h-3 w-3/4 rounded bg-[var(--nc-surface-raised)]" /><div className="mt-3 h-3 w-1/2 rounded bg-[var(--nc-surface-raised)]" /></div>)}</div>
      : products.length === 0 ? <div className="nc-empty"><Search size={28} /><h3 className="text-xl font-semibold tracking-tight">Let's try another direction.</h3><p>No products match these filters. Try a different category, brand, or search.</p><button onClick={() => { setCategory('All finds'); setSelectedBrand(null) }} className="nc-secondary mt-3">Clear filters</button></div>
      : <div className="nc-products-grid">{products.slice(0,visibleCount).map((product, i) => <ProductCard key={product.id} product={product} stock={availability?.[product.id]} index={i % 12} />)}</div>}
    {products.length > visibleCount && <div className="mt-10 text-center"><button className="nc-secondary" onClick={() => setVisibleCount((count) => count + 12)}>A few more good finds <ArrowDown size={14} /></button><p className="nc-muted mt-3 text-[10px]">{visibleCount} of {products.length} products</p></div>}
  </div>
}

export function ProductCard({ product, stock, index = 0 }: { product: StoreProduct; stock?: number; index?: number }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const isSaved = useCommerceStore((state) => state.wishlist.includes(product.id))
  const cartQuantity = useCommerceStore((state) => state.cart[product.id] ?? 0)
  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist)
  const addToCart = useCommerceStore((state) => state.addToCart)
  const discount = product.originalPriceINR && product.originalPriceINR > product.priceINR ? Math.round((1-product.priceINR/product.originalPriceINR)*100) : 0

  return <>
    <motion.article className="nc-product-card" initial={reduceMotion ? false : {opacity: 0, y: 14}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.08}} transition={{duration:.4,delay: Math.min(index*.025,.15)}}>
      <div className="nc-product-image">
        <Link to={`/products/${product.id}`} tabIndex={-1} aria-hidden="true"><img src={product.image} alt="" loading="lazy" onError={(event) => replaceBrokenProductImage(event,product.title,product.brand)} /></Link>
        {(product.badge || discount > 0) && <span className="nc-product-badge">{product.badge || `${discount}% off`}</span>}
        <button type="button" onClick={() => toggleWishlist(product.id)} aria-label={`${isSaved ? 'Remove' : 'Save'} ${product.title}${isSaved ? ' from wishlist' : ' to wishlist'}`} aria-pressed={isSaved} className="nc-heart"><Heart size={14} fill={isSaved ? 'currentColor' : 'none'} /></button>
        <button type="button" className="nc-product-quick" onClick={() => setQuickViewOpen(true)} aria-label={`Quick view ${product.title}`}><Eye size={12} /> Quick look</button>
      </div>
      <div className="nc-product-details">
        <div className="nc-product-meta"><span className="truncate">{product.brand}</span><span className="nc-product-rating"><Star />{product.rating}<span className="hidden sm:inline">({product.reviewsCount})</span></span></div>
        <h3 className="line-clamp-2"><Link to={`/products/${product.id}`}>{product.title}</Link></h3>
        <div className="nc-product-bottom"><div className="nc-price">₹{product.priceINR.toLocaleString('en-IN')}{product.originalPriceINR && <span className="nc-old-price">₹{product.originalPriceINR.toLocaleString('en-IN')}</span>}</div><button type="button" className={`nc-add ${cartQuantity ? 'is-added' : ''}`} disabled={stock === 0 || cartQuantity >= 10} onClick={() => addToCart(product.id)} aria-label={`Add ${product.title} to cart`} title={stock === 0 ? 'Sold out' : cartQuantity ? `${cartQuantity} in your bag` : 'Add to bag'}>{cartQuantity ? <Check size={15} /> : <Plus size={16} />}</button></div>
        <p className="nc-product-delivery" aria-live="polite">{stock === 0 ? 'Currently sold out' : cartQuantity ? `${cartQuantity} in your bag` : stock !== undefined && stock <= 5 ? `Only ${stock} left` : product.delivery ?? product.category}</p>
      </div>
    </motion.article>
    <QuickViewModal product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
  </>
}
