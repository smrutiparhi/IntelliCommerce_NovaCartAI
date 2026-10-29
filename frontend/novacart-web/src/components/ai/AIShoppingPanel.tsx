import { useState, useRef, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  Mic,
  Image as ImageIcon,
  Wand2,
  Minimize2,
  RefreshCw,
  Upload,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useAIStore } from '../../stores/ai-store'
import { ImageUploadModal } from './ImageUploadModal'

const QUICK_PROMPTS = [
  'Recommend wireless headphones',
  'What is the delivery policy?',
  'What does the NOVA10 coupon do?',
]

function citationHref(source: string) {
  if (source.startsWith('/products/')) return source
  if (source.startsWith('catalogue/product/')) return `/${source}`
  return undefined
}

export function AIShoppingPanel() {
  const {
    messages,
    searchQuery,
    isPanelOpen,
    togglePanel,
    sendChatMessage,
    triggerImageGeneration,
    setUploadModalOpen,
    confirmCancellation,
    rateMessage,
  } = useAIStore()

  const [inputVal, setInputVal] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!inputVal.trim()) return
    sendChatMessage(inputVal.trim())
    setInputVal('')
  }

  if (!isPanelOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={togglePanel}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-3 text-body-sm font-semibold text-white shadow-xl hover:shadow-2xl transition-transform hover:scale-105"
      >
        <Sparkles className="h-4 w-4 animate-pulse" /> Open NovaCart AI
      </motion.button>
    )
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-dark-border dark:bg-dark-surface">
      <ImageUploadModal />

      {/* Top Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-purple-500 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-body font-bold tracking-tight text-slate-900 dark:text-white">
              NovaCart <span className="text-primary-600">AI</span>
            </h2>
            <p className="text-[11px] font-medium text-slate-400">AI-Powered Shopping Experience</p>
          </div>
        </div>

        <button
          type="button"
          onClick={togglePanel}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-bg"
          aria-label="Collapse AI Panel"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Active Search Tag Pill */}
      {searchQuery && (
        <div className="bg-slate-50/80 px-5 py-2 border-b border-slate-100 dark:bg-dark-bg/60 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 dark:bg-dark-surface dark:border-dark-border dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-ping" />
              {searchQuery}
            </span>
            <button
              type="button"
              onClick={() => triggerImageGeneration(searchQuery)}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <Wand2 className="h-3 w-3" /> Generate AI Images
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message bubble */}
              <div className="flex items-start gap-2.5 max-w-[90%]">
                {msg.sender === 'ai' && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold">
                    AI
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-body-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none dark:bg-primary-600'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none dark:bg-dark-bg dark:text-slate-200'
                  }`}
                >
                  {/* Reference Image attached in user prompt */}
                  {msg.referenceImage && (
                    <div className="mb-2 overflow-hidden rounded-xl border border-white/20">
                      <img src={msg.referenceImage} alt="Uploaded reference" className="h-28 w-full object-cover" />
                    </div>
                  )}

                  {msg.text && <p>{msg.text}</p>}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 border-t border-current/10 pt-2 text-[10px] opacity-75">
                      <p className="font-bold uppercase tracking-wider">Grounded in catalogue</p>
                      {msg.citations.slice(0, 3).map((citation) => {
                        const href = citationHref(citation.source)
                        return href
                          ? <a key={citation.id} href={href} className="mt-1 block truncate underline decoration-current/30 underline-offset-2 hover:opacity-100">↗ {citation.title}</a>
                          : <p key={citation.id} className="mt-1 truncate">↗ {citation.title}</p>
                      })}
                    </div>
                  )}
                  {msg.cancellation && !msg.cancellation.confirmed && (
                    <button type="button" onClick={() => confirmCancellation(msg.id, msg.cancellation!.confirmationToken)} className="mt-3 rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-600">Confirm cancellation</button>
                  )}
                  {msg.comparison && <div className="mt-3 grid gap-2 border-t border-current/10 pt-3">{msg.comparison.products.map((product) => <a key={product.id} href={`/products/${product.id}`} className="rounded-xl border border-current/10 p-2 hover:bg-current/5"><p className="truncate text-[11px] font-bold">{product.title}</p><p className="mt-1 text-[10px] opacity-70">{product.brand} · ₹{Math.round(product.priceInPaise / 100).toLocaleString('en-IN')} · ★ {product.rating.toFixed(1)}</p></a>)}</div>}
                </div>
              </div>

              {/* AI Image Generation Widget inside chat */}
              {msg.isGeneratingImages && (
                <div className="mt-3 w-full rounded-2xl border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-900/60 dark:bg-primary-950/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-3">
                    <Wand2 className="h-4 w-4 animate-spin text-primary-500" />
                    Generating AI Images...
                  </div>
                  {/* Shimmer placeholders */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Images Grid */}
              {msg.generatedImages && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-dark-border dark:bg-dark-bg"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {msg.generatedImages.map((genImg) => (
                      <div
                        key={genImg.id}
                        className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-dark-border dark:bg-dark-surface"
                      >
                        <img
                          src={genImg.image}
                          alt={genImg.title}
                          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="p-2">
                          <p className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            {genImg.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions under AI generated grid */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-dark-border">
                    <button
                      type="button"
                      onClick={() => triggerImageGeneration('more variation')}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-surface dark:text-slate-300"
                    >
                      <RefreshCw className="h-3 w-3 text-primary-500" /> Make Variation
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-surface dark:text-slate-300"
                    >
                      <Upload className="h-3 w-3 text-primary-500" /> Images Upload
                    </button>
                  </div>
                </motion.div>
              )}

              <span className="mt-1 px-1 text-[10px] text-slate-400">{msg.timestamp}</span>
              {msg.sender === 'ai' && msg.id !== 'msg-welcome' && !msg.isGeneratingImages && <div className="mt-1 flex items-center gap-1 pl-9"><button type="button" onClick={() => rateMessage(msg.id, true)} aria-label="Mark response helpful" className={`rounded-full p-1.5 transition ${msg.feedback === 'helpful' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}><ThumbsUp size={12} /></button><button type="button" onClick={() => rateMessage(msg.id, false)} aria-label="Mark response not helpful" className={`rounded-full p-1.5 transition ${msg.feedback === 'not-helpful' ? 'bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}><ThumbsDown size={12} /></button>{msg.feedback && <span className="ml-1 text-[10px] text-slate-400">Thanks for the feedback</span>}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggest pills */}
      <div className="border-t border-slate-100 px-5 py-2.5 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendChatMessage(prompt)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-primary-400 hover:text-primary-600 dark:border-dark-border dark:bg-dark-surface dark:text-slate-300 dark:hover:border-primary-500 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1.5 dark:border-dark-border dark:bg-dark-bg focus-within:ring-2 focus-within:ring-primary-500/20">
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            title="Upload Image for visual search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-dark-surface transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Voice input"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-dark-surface transition-colors"
          >
            <Mic className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask anything..."
            aria-label="Ask Nova AI"
            className="min-w-0 flex-1 bg-transparent text-body-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
