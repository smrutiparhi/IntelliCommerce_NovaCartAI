import { ArrowUpRight, LockKeyhole, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'

const columns = [
  { title: 'Discover', links: [['/home', 'The collection'], ['/categories', 'Shop by category'], ['/search?q=New', 'New arrivals'], ['/search?q=Deals', 'The sale edit']] },
  { title: 'Your NovaCart', links: [['/profile', 'My account'], ['/orders', 'Orders & tracking'], ['/wishlist', 'Your wishlist'], ['/seller', 'Seller studio']] },
  { title: 'Good to know', links: [['/support', 'Help & support'], ['/support', 'Shipping & delivery'], ['/support', 'Returns & refunds'], ['/settings', 'Privacy & settings']] },
]

export function Footer() {
  return <footer className="nc-footer"><div className="nc-shell">
    <div className="nc-footer-top"><div><p className="nc-label !mb-3">A little curiosity goes a long way.</p><h2>Meet your next favourite.</h2><p>A considered collection for a life well lived.</p></div><Link to="/ai-assistant" className="nc-secondary"><Sparkles size={16} /> Meet Nova AI <ArrowUpRight size={16} /></Link></div>
    <div className="nc-footer-links"><div><BrandLogo /><p className="mt-5 max-w-56">Smart shopping. Better living.<br />Make room for the good things.</p></div>{columns.map(({title,links}) => <div key={title}><h3>{title}</h3><ul>{links.map(([to,label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul></div>)}</div>
    <div className="nc-footer-bottom"><p>© {new Date().getFullYear()} NovaCart. All rights reserved.</p><span><LockKeyhole size={12} /> Secured by Razorpay <span>·</span> Made with care, in India</span></div>
  </div></footer>
}
