import { ArrowUpRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCommerceStore } from '../stores/commerce-store'
import { useAvailability, useCatalogue } from '../hooks/useCatalogue'
import { ProductCard } from '../components/store/ProductCardGrid'

export function WishlistPage() {
  const wishlist = useCommerceStore((state) => state.wishlist)
  const remove = useCommerceStore((state) => state.removeFromWishlist)
  const { data: catalogue, isLoading } = useCatalogue()
  const { data: availability } = useAvailability()
  const products = catalogue?.products.filter((product) => wishlist.includes(product.id)) ?? []
  const unknown = wishlist.filter((id) => !products.some((p) => p.id === id))
  return <div className="nc-shell nc-account-page py-12 min-h-[65vh]">
    <header className="nc-section-head border-b pb-7"><div><p className="nc-label">A little collection of you</p><h1 className="text-h1 mt-4">Saved for a good day.</h1><p className="nc-muted mt-4 text-sm">All the things that caught your eye, in one happy place.</p></div><span className="nc-text-link nc-muted"><Heart size={15} /> {wishlist.length} saved</span></header>
    {isLoading ? <p className="nc-muted py-12 text-sm">Finding your favourites…</p> : !wishlist.length ? <section className="nc-empty"><Heart size={30} /><h2 className="text-2xl font-semibold tracking-tight">Good things are worth keeping.</h2><p>Tap the heart on anything you love. We'll keep it here until you're ready.</p><Link to="/home" className="nc-primary mt-5">Find a favourite <ArrowUpRight size={15} /></Link></section> : <><section className="nc-products-grid">{products.map((product) => <ProductCard key={product.id} product={product} stock={availability?.[product.id]} />)}</section>{unknown.map((id) => <div className="mt-5 flex justify-between rounded-xl border p-5 text-xs" key={id}><p>Product details are currently unavailable.</p><button onClick={() => remove(id)}>Remove from wishlist</button></div>)}</>}
  </div>
}
