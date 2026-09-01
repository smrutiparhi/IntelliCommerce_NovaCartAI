import { describe, expect, it } from 'vitest'
import { mapApiProduct, type ProductApiModel } from './products'

describe('mapApiProduct', () => {
  it('uses the stable slug as the commerce identifier and converts paise to rupees', () => {
    const source: ProductApiModel = {
      id: 'mongo-id', slug: 'nova-watch', sellerId: 'seller-1', title: 'Nova Watch', brand: 'Nova',
      categorySlug: 'accessories', priceInPaise: 199900, originalPriceInPaise: 249900,
      description: 'A precise watch.', images: ['watch.jpg'], tags: ['watch'], badge: 'New',
      delivery: 'Free delivery', rating: 4.5, reviewCount: 1280, active: true,
    }

    const product = mapApiProduct(source)

    expect(product.id).toBe('nova-watch')
    expect(product.sellerId).toBe('seller-1')
    expect(product.priceINR).toBe(1999)
    expect(product.originalPriceINR).toBe(2499)
    expect(product.category).toBe('Accessories')
    expect(product.reviewsCount).toBe('1,280')
  })
})
