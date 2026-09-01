import type { SyntheticEvent } from 'react'

export function productImageFallback(title: string, brand = 'NovaCart') {
  const initials = title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || 'N'
  const safeTitle = escapeXml(title.length > 34 ? `${title.slice(0, 31)}…` : title)
  const safeBrand = escapeXml(brand.toUpperCase())
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#11131a"/><stop offset=".55" stop-color="#241044"/><stop offset="1" stop-color="#7c3aed"/></linearGradient><radialGradient id="r"><stop stop-color="#dfff36" stop-opacity=".24"/><stop offset="1" stop-color="#dfff36" stop-opacity="0"/></radialGradient></defs><rect width="900" height="900" rx="70" fill="url(#g)"/><circle cx="720" cy="130" r="330" fill="url(#r)"/><path d="M100 670C260 490 430 780 800 460" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="110"/><rect x="90" y="90" width="720" height="720" rx="54" fill="none" stroke="#fff" stroke-opacity=".12"/><text x="450" y="410" text-anchor="middle" fill="#dfff36" font-family="Arial,sans-serif" font-size="180" font-weight="800">${initials}</text><text x="450" y="590" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="34" font-weight="700">${safeTitle}</text><text x="450" y="650" text-anchor="middle" fill="#a9b0c3" font-family="Arial,sans-serif" font-size="20" letter-spacing="7">${safeBrand}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function replaceBrokenProductImage(event: SyntheticEvent<HTMLImageElement>, title: string, brand?: string) {
  const image = event.currentTarget
  image.onerror = null
  image.src = productImageFallback(title, brand)
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character] ?? character)
}
