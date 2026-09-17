import { Check } from 'lucide-react'

export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return <ol className="nc-steps" aria-label="Checkout progress">{['Your bag', 'Delivery', 'Payment'].map((label, index) => <li key={label} aria-current={current === index ? 'step' : undefined} className={index < current ? 'is-complete' : ''}><span className="nc-step-number">{index < current ? <Check size={12} /> : String(index + 1).padStart(2,'0')}</span>{label}</li>)}</ol>
}
