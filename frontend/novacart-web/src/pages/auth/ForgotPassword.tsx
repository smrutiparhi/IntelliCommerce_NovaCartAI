import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthLayout } from './AuthLayout'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { forgotPassword } from '../../api/auth'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type Form = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const mutation = useMutation({ mutationFn: ({ email }: Form) => forgotPassword(email) })

  if (mutation.isSuccess) {
    return (
      <AuthLayout title="Check your email" subtitle="If that address exists, we've sent a reset link — it expires in 15 minutes.">
        <Link to="/login" className="text-body-sm font-medium text-primary-600 hover:underline">
          Back to sign in
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
        </FormField>

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Sending…' : 'Send reset link'}
        </Button>
        {mutation.isError && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-body-sm text-rose-600">
            We couldn't send the reset link. Please check your connection and try again.
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-body-sm text-slate-500 dark:text-slate-400">
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
