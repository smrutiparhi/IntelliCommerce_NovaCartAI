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

  it('repairs obsolete Amazon thumbnail transforms before rendering', () => {
    const source: ProductApiModel = {
      id: 'mongo-id', slug: 'india-b086wmscn3', sellerId: 'novacart-seed', title: 'boAt Airdopes 171', brand: 'boAt',
      categorySlug: 'audio', priceInPaise: 119900, originalPriceInPaise: 599900,
      description: 'Wireless earbuds.',
      images: ['https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/41IAc+vLV7S._SY300_SX300_.jpg'],
      tags: ['audio'], rating: 3.9, reviewCount: 47521, active: true,
    }

    expect(mapApiProduct(source).image).toBe('https://m.media-amazon.com/images/I/41IAc+vLV7S._SL600_.jpg')
  })
})
