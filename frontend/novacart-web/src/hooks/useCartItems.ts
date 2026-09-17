import { PRODUCTS } from '../data/store-products'
import { useCommerceStore } from '../stores/commerce-store'
import { useCatalogue } from './useCatalogue'

export function useCartItems() {
  const cart = useCommerceStore((state) => state.cart)
  const { data: catalogue, isLoading } = useCatalogue()
  const products = catalogue?.products ?? PRODUCTS
  const items = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = products.find((item) => item.id === id)
    return product ? [{ product, quantity }] : []
  })
  const unresolvedIds = Object.keys(cart).filter((id) => !products.some((product) => product.id === id))
  return { items, unresolvedIds, isLoading }
}
