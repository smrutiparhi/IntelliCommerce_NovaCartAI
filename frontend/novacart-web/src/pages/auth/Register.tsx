import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthLayout } from './AuthLayout'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { Button } from '../../components/ui/Button'
import { register as registerUser } from '../../api/auth'
import { useAuthStore } from '../../stores/auth-store'
import { isApiError } from '../../lib/api-client'
import { cn } from '../../lib/utils'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['ROLE_CUSTOMER', 'ROLE_SELLER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'ROLE_CUSTOMER' },
  })

  const role = watch('role')

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken)
      navigate(user.roles.includes('ROLE_SELLER') ? '/seller' : '/home', { replace: true })
    },
    onError: (error) => {
      const message = isApiError(error) ? error.response?.data.error.message : 'Something went wrong. Please try again.'
      setError('root', { message: message ?? 'Registration failed' })
    },
  })

  return (
    <AuthLayout title="Create your account" subtitle="Join NovaCart AI as a shopper or a seller">
      <form
        onSubmit={handleSubmit(({ confirmPassword: _confirmPassword, ...payload }) => mutation.mutate(payload))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-1 dark:border-dark-border" role="radiogroup" aria-label="Account type">
          {(['ROLE_CUSTOMER', 'ROLE_SELLER'] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={role === r}
              onClick={() => setValue('role', r)}
              className={cn(
                'rounded-md py-2 text-body-sm font-medium transition-colors duration',
                role === r ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-border',
              )}
            >
              {r === 'ROLE_CUSTOMER' ? 'Shopper' : 'Seller'}
            </button>
          ))}
        </div>

        <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" error={!!errors.fullName} {...register('fullName')} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" error={!!errors.password} {...register('password')} />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        {errors.root && (
          <p role="alert" className="rounded-md bg-error-500/10 px-3 py-2 text-body-sm text-error-500">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
