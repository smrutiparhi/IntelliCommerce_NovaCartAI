import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-body text-slate-900',
      'placeholder:text-slate-400',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
      'dark:border-dark-border dark:bg-dark-surface dark:text-slate-100',
      error && 'border-error-500 focus-visible:ring-error-500',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
