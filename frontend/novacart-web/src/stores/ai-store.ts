import { create } from 'zustand'
import { AI_GENERATED_FLORAL, AI_GENERATED_PUFFERS } from '../data/store-products'
import { askNova, proposeCancellation, confirmCancellation, compareNovaProducts, submitAiFeedback } from '../api/ai'

export interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text?: string
  generatedImages?: { id: string; title: string; image: string }[]
  isGeneratingImages?: boolean
  referenceImage?: string
  citations?: { id: string; title: string; source: string }[]
  mode?: string
  cancellation?: { confirmationToken: string; orderId: string; expiresAt: string; confirmed?: boolean }
  comparison?: { products: Array<{ id: string; title: string; brand: string; priceInPaise: number; rating: number }> }
  feedback?: 'helpful' | 'not-helpful'
  timestamp: string
}

interface AIState {
  searchQuery: string
  selectedBrand: string | null
  isPanelOpen: boolean
  isUploadModalOpen: boolean
  isGenerating: boolean
  uploadedImage: string | null
  messages: ChatMessage[]

  setSearchQuery: (query: string) => void
  setSelectedBrand: (brand: string | null) => void
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setUploadModalOpen: (open: boolean) => void
  sendChatMessage: (text: string) => Promise<void>
  confirmCancellation: (messageId: string, token: string) => Promise<void>
  rateMessage: (messageId: string, helpful: boolean) => Promise<void>
  triggerImageGeneration: (prompt?: string) => void
  handleImageUpload: (imageUrl: string, searchPrompt?: string) => void
}

export const useAIStore = create<AIState>((set, get) => ({
  searchQuery: '',
  selectedBrand: null,
  isPanelOpen: false,
  isUploadModalOpen: false,
  isGenerating: false,
  uploadedImage: null,
  messages: [
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'Hello! I am your NovaCart AI Shopping Assistant. Ask me anything about products, categories, or styles!',
      timestamp: 'Just now',
    },
  ],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),

  sendChatMessage: async (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: time,
    }

    set((state) => ({
      messages: [...state.messages, userMsg],
      searchQuery: text,
    }))

    const lower = text.toLowerCase()
    const cancelMatch = lower.match(/(?:cancel|stop)\s+(?:order\s+)?([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i)
    if (cancelMatch) {
      try {
        const proposal = await proposeCancellation(cancelMatch[1])
        set((state) => ({ messages: [...state.messages, { id: `ai-cancel-${Date.now()}`, sender: 'ai', text: proposal.message, cancellation: { confirmationToken: proposal.confirmationToken, orderId: proposal.orderId, expiresAt: proposal.expiresAt }, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }))
      } catch {
        set((state) => ({ messages: [...state.messages, { id: `ai-cancel-error-${Date.now()}`, sender: 'ai', text: 'I could not prepare cancellation for that order. It may already be shipped, cancelled, or not belong to your account.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }))
      }
      return
    }
    const compareMatch = text.match(/compare\s+(.+?)\s+(?:vs\.?|and|with)\s+(.+)/i)
    if (compareMatch) {
      try {
        const reply = await compareNovaProducts(compareMatch[1].trim(), compareMatch[2].trim())
        set((state) => ({ messages: [...state.messages, { id: `ai-compare-${Date.now()}`, sender: 'ai', text: reply.summary, citations: reply.citations, comparison: { products: reply.products }, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }))
      } catch {
        set((state) => ({ messages: [...state.messages, { id: `ai-compare-error-${Date.now()}`, sender: 'ai', text: 'I could not compare those products. Use their exact catalogue names or slugs and try again.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }))
      }
      return
    }
    if (lower.includes('generate') || lower.includes('image') || lower.includes('patterned')) {
      get().triggerImageGeneration(text)
    } else {
      try {
        const reply = await askNova(text)
        set((state) => ({ messages: [...state.messages, {
          id: `ai-${Date.now()}`, sender: 'ai', text: reply.answer,
          citations: reply.citations, mode: reply.mode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }] }))
      } catch {
        set((state) => ({ messages: [...state.messages, {
          id: `ai-error-${Date.now()}`, sender: 'ai',
          text: 'Nova is temporarily unavailable. You can still browse the live catalogue while I reconnect.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }] }))
      }
    }
  },

  confirmCancellation: async (messageId, token) => {
    try {
      const result = await confirmCancellation(token)
      set((state) => ({ messages: state.messages.map((message) => message.id === messageId ? { ...message, text: result.message, cancellation: message.cancellation ? { ...message.cancellation, confirmed: true } : undefined } : message) }))
    } catch {
      set((state) => ({ messages: state.messages.map((message) => message.id === messageId ? { ...message, text: 'Cancellation confirmation expired or was already used.', cancellation: undefined } : message) }))
    }
  },

  rateMessage: async (messageId, helpful) => {
    set((state) => ({ messages: state.messages.map((message) => message.id === messageId ? { ...message, feedback: helpful ? 'helpful' : 'not-helpful' } : message) }))
    try { await submitAiFeedback(messageId, helpful) }
    catch { set((state) => ({ messages: state.messages.map((message) => message.id === messageId ? { ...message, feedback: undefined } : message) })) }
  },

  triggerImageGeneration: (prompt) => {
    const isFloral = prompt?.toLowerCase().includes('floral')
    const placeholderMsgId = `gen-placeholder-${Date.now()}`
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    set((state) => ({
      isGenerating: true,
      messages: [
        ...state.messages,
        {
          id: placeholderMsgId,
          sender: 'ai',
          text: 'Generating AI Images...',
          isGeneratingImages: true,
          timestamp: time,
        },
      ],
    }))

    // Simulate AI generation completion after 1.8 seconds
    setTimeout(() => {
      const generatedList = isFloral ? AI_GENERATED_FLORAL : AI_GENERATED_PUFFERS
      set((state) => ({
        isGenerating: false,
        messages: state.messages.map((m) =>
          m.id === placeholderMsgId
            ? {
                id: `ai-gen-complete-${Date.now()}`,
                sender: 'ai',
                text: isFloral
                  ? 'Here are custom floral patterned puffer jacket variations generated just for you:'
                  : 'Colorful puffer with a yellow collar, bold panels, bright pockets, and a playful, modern vibe.',
                generatedImages: generatedList,
                isGeneratingImages: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : m,
        ),
      }))
    }, 1800)
  },

  handleImageUpload: (imageUrl, searchPrompt) => {
    const promptText = searchPrompt || 'Can you show me more jacket items like this?'
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChatMessage = {
      id: `upload-${Date.now()}`,
      sender: 'user',
      text: promptText,
      referenceImage: imageUrl,
      timestamp: time,
    }

    set((state) => ({
      uploadedImage: imageUrl,
      searchQuery: 'casual ripped denim jacket',
      messages: [...state.messages, userMsg],
      isUploadModalOpen: false,
    }))

    // Simulate visual similarity search AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai-vis-${Date.now()}`,
        sender: 'ai',
        text: 'Sure! Here are some matching jacket items inspired by your uploaded reference:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      set((state) => ({ messages: [...state.messages, aiMsg] }))
    }, 900)
  },
}))
