import { apiClient } from '../lib/api-client'
import { PRODUCTS, type StoreProduct } from '../data/store-products'
import { productImageFallback } from '../lib/product-image'

export interface ProductApiModel {
  id: string
  slug: string
  sellerId: string
  title: string
  brand: string
  categorySlug: string
  priceInPaise: number
  originalPriceInPaise?: number | null
  description: string
  images: string[]
  tags: string[]
  badge?: string | null
  delivery?: string | null
  rating: number
  reviewCount: number
  active: boolean
}

interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CatalogueResult {
  products: StoreProduct[]
  source: 'api' | 'fallback'
  total: number
}

export interface ProductWritePayload {
  title: string
  brand: string
  categorySlug: string
  priceInPaise: number
  originalPriceInPaise?: number | null
  description: string
  images: string[]
  tags: string[]
  badge?: string
  delivery?: string
  active: boolean
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  customerName: string
  rating: number
  title: string
  comment: string
  verifiedPurchase: boolean
  updatedAt: string
}

export interface ReviewWritePayload { rating: number; title: string; comment: string }

export async function getProductReviews(idOrSlug: string): Promise<ProductReview[]> {
  return (await apiClient.get<ProductReview[]>(`/products/${encodeURIComponent(idOrSlug)}/reviews`)).data
}

export async function saveProductReview(idOrSlug: string, payload: ReviewWritePayload): Promise<ProductReview> {
  return (await apiClient.post<ProductReview>(`/products/${encodeURIComponent(idOrSlug)}/reviews`, payload)).data
}

async function fetchAllProducts(): Promise<{ products: ProductApiModel[]; total: number }> {
  const first = (await apiClient.get<SpringPage<ProductApiModel>>('/products', { params: { page: 0, size: 100, sort: 'newest' } })).data
  const remaining = first.totalPages > 1
    ? await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) => apiClient.get<SpringPage<ProductApiModel>>('/products', { params: { page: index + 1, size: 100, sort: 'newest' } })))
    : []
  return { products: [...first.content, ...remaining.flatMap((response) => response.data.content)], total: first.totalElements }
}

export async function getRawCatalogue(): Promise<ProductApiModel[]> {
  return (await fetchAllProducts()).products
}

export async function getSellerProducts(): Promise<ProductApiModel[]> {
  const response = await apiClient.get<ProductApiModel[]>('/products/seller/me')
  return response.data
}

export async function createProduct(payload: ProductWritePayload): Promise<ProductApiModel> {
  const response = await apiClient.post<ProductApiModel>('/products', payload)
  return response.data
}

export async function updateProduct(id: string, payload: ProductWritePayload): Promise<ProductApiModel> {
  const response = await apiClient.put<ProductApiModel>(`/products/${encodeURIComponent(id)}`, payload)
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${encodeURIComponent(id)}`)
}

const titleCase = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export function mapApiProduct(product: ProductApiModel): StoreProduct {
  return {
    id: product.slug,
    sellerId: product.sellerId,
    title: product.title,
    brand: product.brand,
    priceINR: Math.round(product.priceInPaise / 100),
    originalPriceINR: product.originalPriceInPaise ? Math.round(product.originalPriceInPaise / 100) : undefined,
    rating: product.rating,
    reviewsCount: product.reviewCount.toLocaleString('en-IN'),
    image: product.images[0] || productImageFallback(product.title, product.brand),
    category: titleCase(product.categorySlug),
    tags: product.tags ?? [],
    badge: product.badge ?? undefined,
    delivery: product.delivery ?? undefined,
    description: product.description,
  }
}

export async function getCatalogue(): Promise<CatalogueResult> {
  try {
    const response = await fetchAllProducts()
    const remote = response.products.map(mapApiProduct)
    if (remote.length === 0) return { products: PRODUCTS, source: 'fallback', total: PRODUCTS.length }

    // The local seed remains visible until every listing has migrated to MongoDB.
    // Remote records win by slug, so the transition never duplicates a product.
    const merged = new Map(PRODUCTS.map((product) => [product.id, product]))
    remote.forEach((product) => merged.set(product.id, product))
    return { products: [...merged.values()], source: 'api', total: response.total }
  } catch {
    return { products: PRODUCTS, source: 'fallback', total: PRODUCTS.length }
  }
}

export async function getProduct(idOrSlug: string): Promise<{ product?: StoreProduct; source: 'api' | 'fallback' }> {
  try {
    const response = await apiClient.get<ProductApiModel>(`/products/${encodeURIComponent(idOrSlug)}`)
    return { product: mapApiProduct(response.data), source: 'api' }
  } catch {
    return { product: PRODUCTS.find((product) => product.id === idOrSlug), source: 'fallback' }
  }
}
