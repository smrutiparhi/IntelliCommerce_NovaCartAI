import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react'
import { useAIStore } from '../../stores/ai-store'

const SAMPLE_UPLOADS = [
  {
    name: 'jacket3.png',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    label: 'Casual Denim Jacket',
  },
  {
    name: 'puffer_multi.png',
    url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=400&q=80',
    label: 'Multicolor Puffer',
  },
  {
    name: 'floral_jacket.png',
    url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    label: 'Floral Puffer',
  },
]

export function ImageUploadModal() {
  const { isUploadModalOpen, setUploadModalOpen, handleImageUpload } = useAIStore()

  if (!isUploadModalOpen) return null

  function handleSelect(url: string) {
    handleImageUpload(url, 'Can you show me more jacket items like this?')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setUploadModalOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-dark-border dark:bg-dark-surface"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              <h3 className="text-h4 font-bold text-slate-900 dark:text-white">Visual Similarity Search</h3>
            </div>
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-bg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Upload Drop Area */}
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/50 p-8 text-center dark:border-primary-800 dark:bg-primary-950/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300">
              <Upload className="h-7 w-7" />
            </div>
            <p className="mt-3 text-body font-semibold text-slate-800 dark:text-slate-200">
              Click to Upload Or Drag &amp; Drop
            </p>
            <p className="mt-1 text-caption text-slate-500">Max File Size: 10 MB (PNG, JPG, WEBP)</p>

            <button
              type="button"
              onClick={() => handleSelect(SAMPLE_UPLOADS[0].url)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-body-sm font-semibold text-white shadow-md hover:bg-primary-700 transition-transform active:scale-95"
            >
              <ImageIcon className="h-4 w-4" /> Select Reference Image
            </button>
          </div>

          {/* Sample preset images */}
          <div className="mt-6">
            <p className="text-caption font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Or pick a sample reference image:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_UPLOADS.map((sample) => (
                <div
                  key={sample.name}
                  onClick={() => handleSelect(sample.url)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 hover:border-primary-500 dark:border-dark-border dark:bg-dark-bg transition-all"
                >
                  <img src={sample.url} alt={sample.label} className="h-20 w-full rounded-lg object-cover" />
                  <p className="mt-1 truncate text-center text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {sample.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
