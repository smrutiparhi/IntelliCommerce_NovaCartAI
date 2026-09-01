import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchRemoteCommerce, remoteCart, remoteWishlist } from '../api/cart'
import { useAuthStore } from './auth-store'

interface CommerceState {
  cart: Record<string, number>
  wishlist: string[]
  syncedUserId: string | null
  addToCart: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  toggleWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  hydrateFromServer: () => Promise<void>
}

const hasSession = () => useAuthStore.getState().isAuthenticated
const ignoreOfflineFailure = (request: Promise<unknown>) => { void request.catch(() => undefined) }

export const useCommerceStore = create<CommerceState>()(
  persist(
    (set, get) => ({
      cart: {},
      wishlist: [],
      syncedUserId: null,
      addToCart: (productId, quantity = 1) => {
        const next = Math.min(10, (get().cart[productId] ?? 0) + quantity)
        set((state) => ({ cart: { ...state.cart, [productId]: next } }))
        if (hasSession()) ignoreOfflineFailure(remoteCart.add(productId, quantity))
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeFromCart(productId); return }
        const next = Math.min(10, quantity)
        set((state) => ({ cart: { ...state.cart, [productId]: next } }))
        if (hasSession()) ignoreOfflineFailure(remoteCart.setQuantity(productId, next))
      },
      removeFromCart: (productId) => {
        set((state) => { const cart = { ...state.cart }; delete cart[productId]; return { cart } })
        if (hasSession()) ignoreOfflineFailure(remoteCart.remove(productId))
      },
      clearCart: () => {
        set({ cart: {} })
        if (hasSession()) ignoreOfflineFailure(remoteCart.clear())
      },
      toggleWishlist: (productId) => {
        const exists = get().wishlist.includes(productId)
        set((state) => ({ wishlist: exists ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId] }))
        if (hasSession()) ignoreOfflineFailure(exists ? remoteWishlist.remove(productId) : remoteWishlist.add(productId))
      },
      removeFromWishlist: (productId) => {
        set((state) => ({ wishlist: state.wishlist.filter((id) => id !== productId) }))
        if (hasSession()) ignoreOfflineFailure(remoteWishlist.remove(productId))
      },
      hydrateFromServer: async () => {
        const userId = useAuthStore.getState().user?.id
        if (!userId || get().syncedUserId === userId) return
        try {
          if (get().syncedUserId && get().syncedUserId !== userId) set({ cart: {}, wishlist: [] })
          const remote = await fetchRemoteCommerce()
          const localCart = get().cart
          const mergedCart = { ...remote.cart }
          for (const [productId, quantity] of Object.entries(localCart)) mergedCart[productId] = Math.min(10, Math.max(mergedCart[productId] ?? 0, quantity))
          const mergedWishlist = [...new Set([...remote.wishlist, ...get().wishlist])]
          set({ cart: mergedCart, wishlist: mergedWishlist, syncedUserId: userId })
          await Promise.all([
            ...Object.entries(mergedCart).map(([productId, quantity]) => remoteCart.setQuantity(productId, quantity)),
            ...mergedWishlist.map((productId) => remoteWishlist.add(productId)),
          ])
        } catch {
          // Redis or the backend may be offline during local frontend development.
          // The persisted browser cart remains usable and will retry after reload.
        }
      },
    }),
    { name: 'novacart-commerce', partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, syncedUserId: state.syncedUserId }) },
  ),
)
