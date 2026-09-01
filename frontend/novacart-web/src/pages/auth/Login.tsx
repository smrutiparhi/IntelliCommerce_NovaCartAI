import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthLayout } from './AuthLayout'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { Button } from '../../components/ui/Button'
import { login } from '../../api/auth'
import { useAuthStore } from '../../stores/auth-store'
import { isApiError } from '../../lib/api-client'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken)
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? (user.roles.includes('ROLE_SELLER') ? '/seller' : '/home')
      navigate(redirectTo, { replace: true })
    },
    onError: (error) => {
      const message = isApiError(error)
        ? error.response?.data.error.message
        : 'The sign-in service is unavailable. Start the backend services and try again.'
      setError('root', { message: message ?? 'Login failed' })
    },
  })

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to NovaCart AI">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" error={!!errors.password} {...register('password')} />
        </FormField>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-body-sm font-medium text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {errors.root && (
          <p role="alert" className="rounded-md bg-error-500/10 px-3 py-2 text-body-sm text-error-500">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
