import { Link } from 'react-router-dom'

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  compact?: boolean
}

export function BrandLogo({ className = '', imageClassName = '', compact = false }: BrandLogoProps) {
  return (
    <Link to="/" aria-label="NovaCart home" className={`group inline-flex shrink-0 items-center ${className}`}>
      <img
        src="/novacart-logo-transparent.png"
        alt="NovaCart"
        className={`${compact ? 'h-10 w-[104px]' : 'h-14 w-[148px]'} object-contain object-left transition duration-300 group-hover:scale-[1.025] dark:brightness-0 dark:invert ${imageClassName}`}
      />
    </Link>
  )
}
