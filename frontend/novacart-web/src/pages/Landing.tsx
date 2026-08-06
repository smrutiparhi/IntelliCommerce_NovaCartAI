import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquareText, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'

const features = [
  {
    icon: Sparkles,
    title: 'AI that actually knows your catalogue',
    description:
      'Ask in plain language — "wireless earbuds under ₹5,000 with good battery" — and get grounded answers with citations, never a guess.',
  },
  {
    icon: ShieldCheck,
    title: 'Orders that never get lost mid-flight',
    description:
      'Every purchase runs through a real event-driven saga with automatic compensation — if payment fails, your stock reservation is released, no exceptions.',
  },
  {
    icon: MessageSquareText,
    title: 'An assistant that can actually act',
    description:
      'Track orders, compare products, even cancel a purchase — through a permission-checked agent that always confirms before it does anything real.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' as const },
  }),
}

export function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-[1280px] px-6 pb-20 pt-24 text-center sm:pt-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-body-sm font-medium text-primary-700 dark:border-primary-900 dark:bg-primary-900/30 dark:text-primary-300"
        >
          <Zap className="h-3.5 w-3.5" /> Now shopping smarter with AI
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-display font-semibold tracking-tight"
        >
          The future of intelligent shopping
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          className="mx-auto mt-5 max-w-measure text-body-lg text-slate-600 dark:text-slate-400"
        >
          NovaCart AI pairs a real multi-vendor marketplace with an AI agent grounded in your actual catalogue and
          policies — so it searches, compares, and acts on your behalf, without ever making things up.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link to="/register">
            <Button size="lg">Start shopping</Button>
          </Link>
          <Link to="/products">
            <Button size="lg" variant="secondary">
              Browse catalogue
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-bg"
              >
                <feature.icon className="h-6 w-6 text-primary-600" aria-hidden />
                <h3 className="mt-4 text-h4 font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-body-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
