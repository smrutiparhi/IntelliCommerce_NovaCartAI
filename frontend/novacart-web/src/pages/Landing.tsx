import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, MessageSquareText, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'

const categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Lifestyle']

const differentiators = [
  {
    number: '01',
    title: 'AI grounded in your actual catalogue',
    description: 'Ask in plain language and get answers with citations — never a guess dressed up as fact.',
  },
  {
    number: '02',
    title: 'Orders that never get lost mid-flight',
    description: 'A real event-driven saga with automatic compensation if payment or stock ever falls through.',
  },
  {
    number: '03',
    title: 'An assistant that asks before it acts',
    description: 'Cancel an order or apply a coupon — through a permission-checked agent that always confirms first.',
  },
]

const searchPills = ['AI Picks', 'Electronics', 'Deals', 'Track Order', 'For You']

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' as const },
  }),
}

export function LandingPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleAskAi(e: FormEvent) {
    e.preventDefault()
    navigate('/ai-assistant', { state: { prefill: query } })
  }

  return (
    <div className="bg-cream dark:bg-dark-bg">
      <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-16 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left: headline */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-body-sm font-medium text-primary-700 dark:border-primary-900 dark:bg-primary-900/30 dark:text-primary-300"
            >
              <Sparkles className="h-3.5 w-3.5" /> AI-powered multi-vendor marketplace
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-hero font-semibold text-slate-900 dark:text-white"
            >
              the future of
              <br />
              intelligent shopping
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
              className="mt-6 max-w-measure text-body-lg text-slate-600 dark:text-slate-400"
            >
              A real marketplace with an AI agent grounded in the actual catalogue and policies — it searches,
              compares, and acts on your behalf, without ever making things up.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/register">
                <Button size="lg" className="rounded-full">
                  Start shopping
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="secondary" className="rounded-full">
                  Browse catalogue
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-2"
            >
              {categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-slate-300 px-3 py-1 text-caption font-medium text-slate-600 dark:border-dark-border dark:text-slate-400"
                >
                  {c}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: abstract visual + AI Shop CTA + floating card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative aspect-[4/5] w-full max-w-md justify-self-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-200 via-primary-400 to-accent-400 shadow-xl dark:from-primary-900 dark:via-primary-700 dark:to-primary-500"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(0,0,0,0.25),transparent_50%)]" />

            <Link
              to="/ai-assistant"
              className="group absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full bg-slate-900/90 text-white shadow-lg backdrop-blur transition-transform hover:scale-105"
            >
              <ArrowUpRight className="h-5 w-5" />
              <span className="text-caption font-medium">AI Shop</span>
            </Link>

            <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-white/90 py-2 pl-2 pr-4 shadow-md dark:bg-dark-surface/90">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
                <MessageSquareText className="h-4 w-4" />
              </span>
              <span className="text-caption font-medium text-slate-700 dark:text-slate-200">Try the AI Assistant</span>
            </div>
          </motion.div>
        </div>

        {/* Numbered differentiators */}
        <div className="mt-20 grid grid-cols-1 gap-8 border-t border-black/10 pt-12 dark:border-white/10 sm:grid-cols-3">
          {differentiators.map((d, i) => (
            <motion.div
              key={d.number}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <p className="text-body-sm font-semibold text-primary-600">{d.number}</p>
              <h3 className="mt-2 text-h4 font-semibold tracking-tight text-slate-900 dark:text-white">{d.title}</h3>
              <p className="mt-2 text-body-sm text-slate-600 dark:text-slate-400">{d.description}</p>
            </motion.div>
          ))}
        </div>

        {/* AI search bar */}
        <motion.form
          onSubmit={handleAskAi}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto mt-20 max-w-2xl"
        >
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {searchPills.map((pill) => (
              <span
                key={pill}
                className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-cream-surface px-3 py-1.5 text-caption font-medium text-slate-600 dark:border-dark-border dark:bg-dark-surface dark:text-slate-400"
              >
                <ShieldCheck className="h-3 w-3 text-primary-500" aria-hidden />
                {pill}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white p-2 shadow-lg dark:border-dark-border dark:bg-dark-surface">
            <Sparkles className="ml-3 h-4 w-4 shrink-0 text-primary-500" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about any product…"
              aria-label="Ask the AI assistant about any product"
              className="h-10 flex-1 bg-transparent text-body-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
            <button
              type="submit"
              className="flex h-10 items-center gap-1.5 rounded-full bg-primary-600 px-4 text-body-sm font-medium text-white hover:bg-primary-700"
            >
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.form>
      </section>
    </div>
  )
}
