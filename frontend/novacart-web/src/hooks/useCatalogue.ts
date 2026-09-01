import { useQuery } from '@tanstack/react-query'
import { getCatalogue, getProduct } from '../api/products'
import { getAvailability, getProductInventory } from '../api/inventory'

export function useCatalogue() {
  return useQuery({ queryKey: ['catalogue'], queryFn: getCatalogue, staleTime: 1000 * 60 * 5 })
}

export function useAvailability() {
  return useQuery({ queryKey: ['availability'], queryFn: getAvailability, staleTime: 30_000 })
}

export function useProductInventory(productId?: string) {
  return useQuery({ queryKey: ['inventory', productId], queryFn: () => getProductInventory(productId!), enabled: Boolean(productId), staleTime: 30_000 })
}

export function useProduct(idOrSlug?: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => getProduct(idOrSlug!),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  })
}
