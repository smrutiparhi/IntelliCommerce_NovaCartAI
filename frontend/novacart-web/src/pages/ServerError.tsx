import { Button } from '../components/ui/Button'

export function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--nc-bg)] px-6 text-center text-[var(--nc-text)]">
      <p className="text-display font-semibold tracking-tight text-error-500">500</p>
      <h1 className="mt-2 text-h2 font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-measure text-body text-slate-500 dark:text-slate-400">
        An unexpected error occurred on our end. Please try again in a moment.
      </p>
      <Button size="lg" className="mt-6" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </div>
  )
}
