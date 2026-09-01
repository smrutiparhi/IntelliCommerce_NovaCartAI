import { useQuery } from '@tanstack/react-query'
import { getCatalogue, getProduct } from '../api/products'

export function useCatalogue() {
  return useQuery({ queryKey: ['catalogue'], queryFn: getCatalogue, staleTime: 1000 * 60 * 5 })
}

export function useProduct(idOrSlug?: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => getProduct(idOrSlug!),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  })
}
