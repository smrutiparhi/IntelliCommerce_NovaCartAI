import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DepthCard, Reveal } from '../components/motion/DepthCard'
import { PRODUCTS } from '../data/store-products'
import { useCatalogue } from '../hooks/useCatalogue'

const categories = [
  { name: 'Technology', note: 'Precision for everyday life', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=85', size: 'lg:col-span-2 lg:row-span-2' },
  { name: 'Fashion', note: 'A more personal uniform', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=85', size: '' },
  { name: 'Audio', note: 'Your world, uninterrupted', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85', size: '' },
  { name: 'Home', note: 'Space for better rituals', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85', size: 'lg:col-span-2' },
  { name: 'Beauty', note: 'Care, considered', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85', size: '' },
  { name: 'Sports', note: 'Designed to move', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85', size: '' },
  { name: 'Accessories', note: 'The finishing detail', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85', size: 'lg:col-span-2' },
  { name: 'Appliances', note: 'Everyday work, simplified', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=85', size: '' },
  { name: 'Books', note: 'Ideas worth keeping', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=85', size: '' },
  { name: 'Grocery', note: 'Better pantry rituals', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85', size: 'lg:col-span-2' },
  { name: 'Toys', note: 'Made for curious minds', image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=1200&q=85', size: 'lg:col-span-2' },
]

export function CategoriesPage() {
  const { data: catalogue } = useCatalogue()
  const products = catalogue?.products ?? PRODUCTS
  return (
    <div className="min-h-screen bg-[var(--nc-bg)] py-12 text-[var(--nc-text)] lg:py-18">
      <div className="nc-shell">
        <Reveal className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1fr_.55fr] lg:items-end"><div><p className="nc-label">Explore the catalogue</p><h1 className="mt-5 text-h1">Shop by world,<br /><span className="text-slate-600">not by aisle.</span></h1></div><p className="max-w-md text-sm leading-7 text-slate-500">Explore {products.length} carefully presented products across technology, style, home, wellness, food, reading, and play.</p></Reveal>
        <div className="mt-10 grid auto-rows-[300px] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[260px]">{categories.map((category, index) => <Reveal key={category.name} delay={index * .05} className={category.size}><DepthCard intensity={4} className="h-full rounded-[2rem]"><Link to={`/search?q=${category.name}`} className="nc-depth-surface group relative block h-full text-white overflow-hidden rounded-[2rem] border border-white/10 bg-ink-850"><img src={category.image} alt={`${category.name} category preview`} loading="lazy" className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-[1.055] group-hover:opacity-[.78]" /><div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/5 to-transparent" /><span className="nc-depth-layer absolute right-5 top-5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-slate-300 backdrop-blur">Curated collection</span><div className="nc-depth-layer absolute inset-x-6 bottom-6 flex items-end justify-between gap-4"><div><p className="text-xs text-indigo-300">{category.note}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">{category.name}</h2><p className="mt-1 text-[11px] text-slate-500">{products.filter((product) => product.category === category.name).length} products</p></div><span className="grid h-11 w-11 translate-y-2 place-items-center rounded-full border border-white/15 bg-white/[.06] opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span></div></Link></DepthCard></Reveal>)}</div>
      </div>
    </div>
  )
}
