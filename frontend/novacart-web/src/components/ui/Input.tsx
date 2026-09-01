import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-12 w-full rounded-xl border border-black/10 bg-black/[.025] px-4 text-body-sm text-slate-950 transition duration-200',
      'placeholder:text-slate-400',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/10 focus-visible:border-violet-400 focus-visible:bg-white',
      'dark:border-white/10 dark:bg-white/[.035] dark:text-slate-100 dark:focus-visible:border-[#dfff36]/60 dark:focus-visible:bg-white/[.05]',
      error && 'border-error-500 focus-visible:ring-error-500',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
