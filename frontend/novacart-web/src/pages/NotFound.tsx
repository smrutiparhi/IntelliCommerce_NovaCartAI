import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <p className="text-display font-semibold tracking-tight text-primary-600">404</p>
      <h1 className="mt-2 text-h2 font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-measure text-body text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="mt-6">
        <Button size="lg">Back to home</Button>
      </Link>
    </div>
  )
}
