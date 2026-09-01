import type { ReactNode } from 'react'

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-400">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-caption text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
