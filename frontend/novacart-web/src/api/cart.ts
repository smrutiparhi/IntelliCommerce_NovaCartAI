import { apiClient } from '../lib/api-client'

interface CartApiResponse {
  items: Array<{ productId: string; quantity: number }>
  itemCount: number
}

interface WishlistApiResponse { productIds: string[] }

export async function fetchRemoteCommerce() {
  const [cart, wishlist] = await Promise.all([
    apiClient.get<CartApiResponse>('/cart'),
    apiClient.get<WishlistApiResponse>('/wishlist'),
  ])
  return {
    cart: Object.fromEntries(cart.data.items.map((item) => [item.productId, item.quantity])),
    wishlist: wishlist.data.productIds,
  }
}

export const remoteCart = {
  add: (productId: string, quantity: number) => apiClient.post('/cart/items', { productId, quantity }),
  setQuantity: (productId: string, quantity: number) => apiClient.put(`/cart/items/${encodeURIComponent(productId)}`, { quantity }),
  remove: (productId: string) => apiClient.delete(`/cart/items/${encodeURIComponent(productId)}`),
  clear: () => apiClient.delete('/cart'),
}

export const remoteWishlist = {
  add: (productId: string) => apiClient.post(`/wishlist/${encodeURIComponent(productId)}`),
  remove: (productId: string) => apiClient.delete(`/wishlist/${encodeURIComponent(productId)}`),
}
