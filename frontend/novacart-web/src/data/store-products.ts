export interface StoreProduct {
  id: string
  title: string
  brand: string
  brandLogo?: string
  priceAED: number
  rating: number
  reviewsCount: string
  image: string
  category: string
  tags: string[]
  isAiGenerated?: boolean
  description?: string
}

export interface BrandItem {
  name: string
  subtitle: string
  avatar: string
  shopUrl: string
}

// Clean brand list for real backend data
export const BRANDS: BrandItem[] = []

// Clean product dataset for real backend integration
export const PRODUCTS: StoreProduct[] = []

export const AI_GENERATED_PUFFERS: StoreProduct[] = []
export const AI_GENERATED_FLORAL: StoreProduct[] = []
