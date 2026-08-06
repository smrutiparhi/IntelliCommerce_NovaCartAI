import { create } from 'zustand'
import { AI_GENERATED_FLORAL, AI_GENERATED_PUFFERS } from '../data/store-products'

export interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text?: string
  generatedImages?: { id: string; title: string; image: string }[]
  isGeneratingImages?: boolean
  referenceImage?: string
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
  sendChatMessage: (text: string) => void
  triggerImageGeneration: (prompt?: string) => void
  handleImageUpload: (imageUrl: string, searchPrompt?: string) => void
}

export const useAIStore = create<AIState>((set, get) => ({
  searchQuery: '',
  selectedBrand: null,
  isPanelOpen: true,
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

  sendChatMessage: (text) => {
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
    if (lower.includes('generate') || lower.includes('image') || lower.includes('patterned')) {
      get().triggerImageGeneration(text)
    } else if (lower.includes('denim') || lower.includes('jacket')) {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Sure! Here are some of our top rated denim jackets you might like.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        set((state) => ({ messages: [...state.messages, aiResponse] }))
      }, 700)
    } else {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `I've updated your search results for "${text}". Let me know if you want to generate variations or refine by color and fit!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        set((state) => ({ messages: [...state.messages, aiResponse] }))
      }, 800)
    }
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
