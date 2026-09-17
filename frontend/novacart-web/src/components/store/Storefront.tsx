import { ArrowRight, ArrowUpRight, Headphones, Leaf, PackageCheck, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../motion/DepthCard'
import { ProductCardGrid } from './ProductCardGrid'
import { useAIStore } from '../../stores/ai-store'
import { AIShoppingPanel } from '../ai/AIShoppingPanel'

const photo = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`
const collections = [
  { name: 'Technology', image: 'photo-1496181133206-80ce9b88a853' },
  { name: 'Audio', image: 'photo-1505740420928-5e560c06d30e' },
  { name: 'Fashion', image: 'photo-1549298916-b41d501d3772' },
  { name: 'Home', image: 'photo-1592078615290-033ee584e267' },
  { name: 'Beauty', image: 'photo-1541643600914-78b084683601' },
  { name: 'Sports', image: 'photo-1542291026-7eec264c27ff' },
]

export function Storefront({ member = false }: { member?: boolean }) {
  const isPanelOpen = useAIStore((state) => state.isPanelOpen)
  const togglePanel = useAIStore((state) => state.togglePanel)
  function openAssistant() {
    if (!isPanelOpen) togglePanel()
    requestAnimationFrame(() => {
      const assistant = document.getElementById('nova-shopping-assistant')
      assistant?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
      assistant?.querySelector<HTMLInputElement>('input[type="text"]')?.focus({ preventScroll: true })
    })
  }
  return <div className="nc-shell pb-8">
    <section className="nc-hero" aria-labelledby="storefront-heading">
      <div className="nc-hero-copy">
        <span className="nc-eyebrow">The everyday, elevated</span>
        <h1 id="storefront-heading">Find your<br />next<br /><em>favourite.</em></h1>
        <p>Good design. Great finds. Discover the things that make your everyday a little more you.</p>
        <div className="nc-hero-actions">
          <a href="#shop-products" className="nc-primary">Explore the collection <ArrowUpRight size={16} /></a>
          <button type="button" onClick={openAssistant} className="nc-secondary nc-hero-ai" aria-expanded={isPanelOpen} aria-controls="nova-shopping-assistant"><Sparkles size={16} aria-hidden="true" /> Ask Nova AI</button>
          <Link to="/search?q=New" className="nc-text-link">Just landed <ArrowRight size={14} /></Link>
        </div>
        <div className="nc-hero-foot"><span><Leaf size={16} /></span> A fresh perspective on the things you love.</div>
      </div>
      <div className="nc-hero-visuals">
        <Link to="/search?q=Audio" className="nc-feature nc-feature-main">
          <img src={photo('photo-1505740420928-5e560c06d30e')} alt="Black headphones against a warm yellow backdrop" fetchPriority="high" />
          <div className="nc-feature-label"><span>The listening room</span><span>01 / 03</span></div>
          <div className="nc-feature-caption"><div><p>Tune into something good</p><strong>Sound. Without the noise.</strong></div><span className="nc-round-arrow"><ArrowUpRight size={17} /></span></div>
        </Link>
        <Link to="/search?q=Fashion" className="nc-feature nc-feature-small">
          <img src={photo('photo-1549298916-b41d501d3772',600)} alt="Everyday sneakers in warm earthy tones" />
          <div className="nc-feature-caption"><div><p>Made for your next move</p><strong>Everyday, in style.</strong></div><span className="nc-round-arrow"><ArrowUpRight size={15} /></span></div>
        </Link>
        <Link to="/search?q=Home" className="nc-feature nc-feature-small">
          <img src={photo('photo-1592078615290-033ee584e267',600)} alt="Sculptural green chair in a quiet living space" />
          <div className="nc-feature-caption"><div><p>A place to slow down</p><strong>Make yourself at home.</strong></div><span className="nc-round-arrow"><ArrowUpRight size={15} /></span></div>
        </Link>
      </div>
    </section>
    <div className="nc-service-strip">
      {[{ icon: Truck, title: 'Delivery, made clear', copy: 'Details on every product' }, { icon: ShieldCheck, title: 'Secure checkout', copy: 'Payments with Razorpay' }, { icon: PackageCheck, title: 'Stay in the loop', copy: 'Follow every order' }, { icon: Headphones, title: 'Here to help', copy: 'Support when you need it' }].map(({icon: Icon, title, copy}) => <div key={title}><Icon /><div><strong>{title}</strong><p>{copy}</p></div></div>)}
    </div>
    <section className="nc-section" id="discover">
      <Reveal className="nc-section-head"><div><p className="nc-label">A world of good finds</p><h2>What's your thing?</h2></div><Link to="/categories" className="nc-text-link">All categories <ArrowUpRight size={14} /></Link></Reveal>
      <div className="nc-category-rail">{collections.map(({name,image},index) => <Reveal key={name} delay={index * .035}><Link to={`/search?q=${name}`} className="nc-category-tile"><div><img src={photo(image,400)} alt={name} loading="lazy" /></div><span>{name}<ArrowUpRight /></span></Link></Reveal>)}</div>
    </section>
    <section id="shop-products" className="nc-section scroll-mt-28">
      <Reveal className="nc-section-head"><div><p className="nc-label">Good taste. Even better finds.</p><h2>{member ? 'Your next good find.' : 'Consider this your shortlist.'}</h2></div><p>From little upgrades to everyday essentials.<br />Find something worth making room for.</p></Reveal>
      <button onClick={togglePanel} className="nc-text-link mb-3 hidden lg:inline-flex" aria-expanded={isPanelOpen}><Sparkles size={14} /> {isPanelOpen ? 'Close shopping assistant' : 'Explore with Nova'}</button>
      <div className={isPanelOpen ? 'nc-catalogue-with-assistant grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]' : ''}><ProductCardGrid />{isPanelOpen && <aside id="nova-shopping-assistant" aria-label="Nova AI shopping assistant" className="nc-assistant-slot"><AIShoppingPanel /></aside>}</div>
    </section>
    <Reveal><section className="nc-promo"><div className="nc-promo-copy"><span className="nc-eyebrow">Space for the everyday</span><h2>A little less ordinary.<br />A lot more you.</h2><p>Thoughtful pieces for your favourite corner. Give your space a fresh point of view.</p><Link to="/search?q=Home" className="nc-secondary">Explore the home edit <ArrowUpRight size={15} /></Link></div><div className="nc-promo-art"><img src={photo('photo-1618221195710-dd6b41faaea6')} alt="Warm, thoughtfully furnished living room" loading="lazy" /><span><Sparkles size={20} />THE HOME<br />EDIT</span></div></section></Reveal>
  </div>
}
