import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-600 shadow-card',
  secondary:
    'bg-white text-slate-950 border border-white hover:bg-indigo-100 dark:bg-white/[.05] dark:text-slate-100 dark:border-white/10 dark:hover:bg-white/10',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-surface',
  destructive: 'bg-error-500 text-white hover:bg-rose-600',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-body-sm rounded-full',
  md: 'h-10 px-5 text-body-sm rounded-full',
  lg: 'h-12 px-6 text-body-sm rounded-full',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition duration-200 active:scale-[.99]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
