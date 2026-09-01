export interface StoreProduct {
  id: string
  title: string
  brand: string
  brandLogo?: string
  priceINR: number
  originalPriceINR?: number
  rating: number
  reviewsCount: string
  image: string
  category: string
  tags: string[]
  badge?: string
  delivery?: string
  isAiGenerated?: boolean
  description?: string
}

export interface BrandItem {
  name: string
  subtitle: string
  avatar: string
  shopUrl: string
}

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`

// Original NovaCart seed catalogue for development. Brands and listings are fictional.
export const PRODUCTS: StoreProduct[] = [
  { id: 'nova-orbit-x1', title: 'Orbit X1 5G Smartphone', brand: 'Nova Labs', priceINR: 28999, originalPriceINR: 34999, rating: 4.6, reviewsCount: '2.4k', image: image('photo-1511707171634-5f897ff02aa9'), category: 'Technology', tags: ['phone', 'mobile', '5g', 'smartphone'], badge: 'Bestseller', delivery: 'Free delivery by tomorrow', description: 'A fast, refined 5G phone with a vivid edge-to-edge display, all-day battery, and a camera designed for everyday detail.' },
  { id: 'nova-book-air-14', title: 'Book Air 14 Performance Laptop', brand: 'Nova Labs', priceINR: 64990, originalPriceINR: 74990, rating: 4.7, reviewsCount: '1.1k', image: image('photo-1496181133206-80ce9b88a853'), category: 'Technology', tags: ['laptop', 'computer', 'work', 'student'], badge: 'Nova choice', delivery: 'Free delivery in 2 days', description: 'A lightweight performance laptop with a crisp 14-inch display, quiet cooling, and dependable battery life.' },
  { id: 'luma-view-27', title: 'View 27 QHD Creator Monitor', brand: 'Luma', priceINR: 24999, originalPriceINR: 29999, rating: 4.5, reviewsCount: '684', image: image('photo-1593640408182-31c70c8268f5'), category: 'Technology', tags: ['monitor', 'display', 'desktop', 'creator'], delivery: 'Free delivery in 3 days', description: 'A colour-accurate QHD monitor with a minimal bezel, flexible stand, and one-cable USB-C connectivity.' },
  { id: 'keyframe-k75', title: 'K75 Wireless Mechanical Keyboard', brand: 'Keyframe', priceINR: 5499, originalPriceINR: 6999, rating: 4.6, reviewsCount: '918', image: image('photo-1587829741301-dc798b83add3'), category: 'Technology', tags: ['keyboard', 'gaming', 'wireless', 'computer'], badge: 'Trending', delivery: 'Delivery by tomorrow', description: 'A compact wireless mechanical keyboard with tactile switches, warm backlighting, and multi-device pairing.' },

  { id: 'auralis-studio-one', title: 'Studio One Wireless Headphones', brand: 'Auralis', priceINR: 12999, originalPriceINR: 15999, rating: 4.8, reviewsCount: '3.2k', image: image('photo-1505740420928-5e560c06d30e'), category: 'Audio', tags: ['headphones', 'wireless', 'music', 'noise cancelling'], badge: 'Top rated', delivery: 'Free delivery by tomorrow', description: 'Immersive over-ear headphones with adaptive noise cancellation, spatial audio, and 42-hour listening.' },
  { id: 'pulse-air-mini', title: 'Air Mini True Wireless Earbuds', brand: 'Pulse', priceINR: 3999, originalPriceINR: 5999, rating: 4.4, reviewsCount: '5.8k', image: image('photo-1590658268037-6bf12165a8df'), category: 'Audio', tags: ['earbuds', 'tws', 'wireless', 'music'], badge: 'Great value', delivery: 'Delivery by tomorrow', description: 'Pocket-ready earbuds with clear calls, punchy sound, low-latency mode, and a fast-charging case.' },
  { id: 'resonance-room-speaker', title: 'Room 360 Smart Speaker', brand: 'Resonance', priceINR: 7499, originalPriceINR: 8999, rating: 4.5, reviewsCount: '742', image: image('photo-1608043152269-423dbba4e7e1'), category: 'Audio', tags: ['speaker', 'bluetooth', 'smart home', 'music'], delivery: 'Free delivery in 2 days', description: 'A room-filling wireless speaker with balanced 360-degree sound and understated fabric detailing.' },

  { id: 'waypoint-denim-jacket', title: 'Everyday Selvedge Denim Jacket', brand: 'Waypoint', priceINR: 3299, originalPriceINR: 4499, rating: 4.5, reviewsCount: '1.6k', image: image('photo-1576995853123-5a10305d93c0'), category: 'Fashion', tags: ['denim', 'jacket', 'casual', 'unisex'], badge: 'Bestseller', delivery: 'Delivery in 2 days', description: 'A structured denim jacket with considered seams, durable hardware, and a comfortable broken-in finish.' },
  { id: 'atelier-oxford-shirt', title: 'Relaxed Oxford Cotton Shirt', brand: 'Atelier North', priceINR: 1799, originalPriceINR: 2499, rating: 4.3, reviewsCount: '864', image: image('photo-1603252109303-2751441dd157'), category: 'Fashion', tags: ['shirt', 'cotton', 'formal', 'casual'], delivery: 'Delivery in 3 days', description: 'A breathable cotton Oxford with a softly structured collar and relaxed silhouette.' },
  { id: 'drift-court-sneaker', title: 'Court Everyday Sneakers', brand: 'Drift', priceINR: 2899, originalPriceINR: 3999, rating: 4.6, reviewsCount: '2.8k', image: image('photo-1549298916-b41d501d3772'), category: 'Fashion', tags: ['shoes', 'sneakers', 'casual', 'footwear'], badge: 'Trending', delivery: 'Free delivery in 2 days', description: 'Clean low-profile sneakers with a cushioned footbed, flexible sole, and tonal construction.' },

  { id: 'haven-lounge-chair', title: 'Contour Lounge Chair', brand: 'Haven', priceINR: 18999, originalPriceINR: 22999, rating: 4.7, reviewsCount: '312', image: image('photo-1592078615290-033ee584e267'), category: 'Home', tags: ['chair', 'furniture', 'living room', 'decor'], badge: 'Designer pick', delivery: 'Delivery in 5 days', description: 'A sculptural lounge chair with a supportive curved back, warm timber frame, and textured upholstery.' },
  { id: 'arc-glow-lamp', title: 'Glow Adjustable Table Lamp', brand: 'Arc Living', priceINR: 2699, originalPriceINR: 3499, rating: 4.5, reviewsCount: '704', image: image('photo-1507473885765-e6ed057f782c'), category: 'Home', tags: ['lamp', 'lighting', 'desk', 'decor'], delivery: 'Delivery in 2 days', description: 'A dimmable lamp with warm-to-cool lighting, an adjustable arm, and a calm minimal profile.' },
  { id: 'loom-textured-throw', title: 'Textured Cotton Sofa Throw', brand: 'Loom & Form', priceINR: 1499, originalPriceINR: 1999, rating: 4.4, reviewsCount: '428', image: image('photo-1615874694520-474822394e73'), category: 'Home', tags: ['throw', 'textile', 'bedroom', 'decor'], delivery: 'Delivery in 3 days', description: 'A soft breathable cotton throw with a tactile woven finish for sofas, beds, and reading corners.' },

  { id: 'brewline-espresso', title: 'Compact Espresso Coffee Maker', brand: 'Brewline', priceINR: 8999, originalPriceINR: 11999, rating: 4.6, reviewsCount: '582', image: image('photo-1517668808822-9ebb02f2a0e6'), category: 'Appliances', tags: ['coffee', 'kitchen', 'espresso', 'appliance'], badge: 'Morning favourite', delivery: 'Free delivery in 2 days', description: 'A compact espresso machine with precise temperature control, steam wand, and intuitive operation.' },
  { id: 'aero-crisp-airfryer', title: 'Crisp 5L Digital Air Fryer', brand: 'Aero Home', priceINR: 6499, originalPriceINR: 8499, rating: 4.5, reviewsCount: '1.9k', image: image('photo-1585515320310-259814833e62'), category: 'Appliances', tags: ['air fryer', 'kitchen', 'cooking', 'appliance'], badge: 'Popular', delivery: 'Free delivery by tomorrow', description: 'A family-size air fryer with rapid circulation, eight presets, and an easy-clean non-stick basket.' },
  { id: 'pureflow-air', title: 'Air S2 HEPA Purifier', brand: 'PureFlow', priceINR: 10999, originalPriceINR: 13999, rating: 4.7, reviewsCount: '667', image: image('photo-1585771724684-38269d6639fd'), category: 'Appliances', tags: ['air purifier', 'home', 'hepa', 'appliance'], delivery: 'Free delivery in 2 days', description: 'Quiet HEPA filtration with live air-quality sensing and an automatic night mode.' },

  { id: 'dewdrop-barrier-serum', title: 'Barrier Repair Face Serum', brand: 'Dewdrop', priceINR: 899, originalPriceINR: 1199, rating: 4.6, reviewsCount: '2.1k', image: image('photo-1620916566398-39f1143ab7be'), category: 'Beauty', tags: ['serum', 'skincare', 'face', 'beauty'], badge: 'Beauty favourite', delivery: 'Delivery by tomorrow', description: 'A lightweight daily serum with ceramides and niacinamide for hydrated, resilient skin.' },
  { id: 'velvet-cloud-lip', title: 'Cloud Matte Lip Colour', brand: 'Velvet', priceINR: 699, originalPriceINR: 899, rating: 4.4, reviewsCount: '3.7k', image: image('photo-1586495777744-4413f21062fa'), category: 'Beauty', tags: ['lipstick', 'makeup', 'matte', 'beauty'], badge: 'New shades', delivery: 'Delivery by tomorrow', description: 'A soft-focus matte lip colour with comfortable wear, buildable pigment, and a precise applicator.' },
  { id: 'terra-no7-fragrance', title: 'No. 07 Eau de Parfum', brand: 'Terra', priceINR: 2499, originalPriceINR: 2999, rating: 4.5, reviewsCount: '516', image: image('photo-1541643600914-78b084683601'), category: 'Beauty', tags: ['perfume', 'fragrance', 'grooming', 'beauty'], delivery: 'Free delivery in 2 days', description: 'A modern woody fragrance layered with bergamot, cedar, and a soft mineral finish.' },

  { id: 'motion-pro-mat', title: 'Pro Grip Yoga Mat', brand: 'Motion', priceINR: 2199, originalPriceINR: 2999, rating: 4.7, reviewsCount: '1.4k', image: image('photo-1601925260368-ae2f83cf8b7f'), category: 'Sports', tags: ['yoga', 'fitness', 'mat', 'training'], badge: 'Studio pick', delivery: 'Delivery in 2 days', description: 'A dense supportive yoga mat with dependable dry grip, alignment markings, and a carry strap.' },
  { id: 'stride-flow-runner', title: 'Flow Road Running Shoes', brand: 'Stride', priceINR: 4299, originalPriceINR: 5499, rating: 4.6, reviewsCount: '2.3k', image: image('photo-1542291026-7eec264c27ff'), category: 'Sports', tags: ['running', 'shoes', 'fitness', 'training'], badge: 'Runner favourite', delivery: 'Free delivery in 2 days', description: 'Responsive daily running shoes with breathable mesh, stable cushioning, and a durable outsole.' },
  { id: 'forge-adjustable-dumbbell', title: 'Adjustable Strength Dumbbell', brand: 'Forge', priceINR: 7999, originalPriceINR: 9999, rating: 4.5, reviewsCount: '389', image: image('photo-1517836357463-d25dfeac3438'), category: 'Sports', tags: ['dumbbell', 'gym', 'fitness', 'strength'], delivery: 'Free delivery in 4 days', description: 'A space-saving adjustable dumbbell with quick weight selection and balanced knurled grip.' },

  { id: 'folio-intentional-day', title: 'The Intentional Day', brand: 'Folio Press', priceINR: 499, originalPriceINR: 699, rating: 4.7, reviewsCount: '821', image: image('photo-1544947950-fa07a98d237f'), category: 'Books', tags: ['book', 'productivity', 'nonfiction', 'reading'], badge: 'Editor pick', delivery: 'Delivery in 2 days', description: 'A practical guide to calmer routines, protected attention, and progress on meaningful work.' },
  { id: 'folio-systems-scale', title: 'Systems That Scale', brand: 'Folio Press', priceINR: 649, originalPriceINR: 799, rating: 4.6, reviewsCount: '473', image: image('photo-1524995997946-a1c2e315a42f'), category: 'Books', tags: ['book', 'business', 'technology', 'reading'], delivery: 'Delivery in 2 days', description: 'An accessible field guide to designing reliable products, teams, and operating systems.' },

  { id: 'highland-coffee', title: 'Highland Medium Roast Coffee', brand: 'Field Notes', priceINR: 549, originalPriceINR: 649, rating: 4.8, reviewsCount: '1.2k', image: image('photo-1447933601403-0c6688de566e'), category: 'Grocery', tags: ['coffee', 'beverage', 'pantry', 'grocery'], badge: 'Fresh roast', delivery: 'Delivery by tomorrow', description: 'Freshly roasted whole beans with chocolate, toasted almond, and citrus notes.' },
  { id: 'goodgrain-granola', title: 'Almond & Berry Breakfast Granola', brand: 'Goodgrain', priceINR: 399, originalPriceINR: 475, rating: 4.5, reviewsCount: '638', image: image('photo-1517093157656-b9eccef91cb1'), category: 'Grocery', tags: ['granola', 'breakfast', 'food', 'grocery'], delivery: 'Delivery by tomorrow', description: 'Oven-toasted wholegrain clusters with almonds, berries, and seeds.' },

  { id: 'playform-blocks', title: 'Creative Wooden Building Blocks', brand: 'Playform', priceINR: 1299, originalPriceINR: 1699, rating: 4.7, reviewsCount: '556', image: image('photo-1598880940080-ff9a29891b85'), category: 'Toys', tags: ['toys', 'blocks', 'kids', 'learning'], badge: 'Parent pick', delivery: 'Delivery in 2 days', description: 'Responsibly finished wooden blocks for open-ended building, sorting, and imaginative play.' },
  { id: 'brightbot-starter-kit', title: 'BrightBot Coding Starter Kit', brand: 'BrightBot', priceINR: 3499, originalPriceINR: 4499, rating: 4.6, reviewsCount: '294', image: image('photo-1535378917042-10a22c95931a'), category: 'Toys', tags: ['robot', 'coding', 'stem', 'kids'], delivery: 'Free delivery in 2 days', description: 'A beginner-friendly build-and-code robot kit with guided projects and reusable components.' },

  { id: 'arc-time-steel', title: 'Time Steel Minimal Watch', brand: 'Arc', priceINR: 4999, originalPriceINR: 6499, rating: 4.6, reviewsCount: '772', image: image('photo-1523170335258-f5ed11844a49'), category: 'Accessories', tags: ['watch', 'accessories', 'style', 'unisex'], badge: 'Timeless', delivery: 'Free delivery in 2 days', description: 'A clean everyday watch with a brushed steel case and supple interchangeable strap.' },
  { id: 'metro-daypack-20', title: 'Metro 20L Everyday Backpack', brand: 'Waypoint', priceINR: 2799, originalPriceINR: 3499, rating: 4.5, reviewsCount: '1.1k', image: image('photo-1553062407-98eeb64c6a62'), category: 'Accessories', tags: ['backpack', 'bag', 'travel', 'laptop'], delivery: 'Delivery in 2 days', description: 'A weather-resistant backpack with a padded laptop sleeve and considered organisation.' },
  { id: 'halo-frame-sunglasses', title: 'Frame Polarised Sunglasses', brand: 'Halo', priceINR: 1899, originalPriceINR: 2499, rating: 4.4, reviewsCount: '647', image: image('photo-1511499767150-a48a237f0083'), category: 'Accessories', tags: ['sunglasses', 'eyewear', 'accessories', 'style'], delivery: 'Delivery in 2 days', description: 'Lightweight polarised sunglasses with glare-cutting lenses and a modern silhouette.' },
]

const brandImages = new Map(PRODUCTS.map((product) => [product.brand, product.image]))

export const BRANDS: BrandItem[] = [...brandImages.entries()].map(([name, avatar]) => ({
  name,
  subtitle: 'NovaCart brand',
  avatar,
  shopUrl: `/search?q=${encodeURIComponent(name)}`,
}))

export const AI_GENERATED_PUFFERS: StoreProduct[] = []
export const AI_GENERATED_FLORAL: StoreProduct[] = []
