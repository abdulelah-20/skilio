import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { clsx } from 'clsx'

import { useForgotPassword } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/api/client'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner'
import { AuthFrame } from './AuthFrame'

interface FormValues {
  email: string
}

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()

  function onSubmit(values: FormValues) {
    forgotPassword.mutate({ email: values.email })
  }

  return (
    <AuthFrame
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Enter your parent account email and we will send a secure reset link."
    >
      {forgotPassword.isSuccess ? (
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-primary-800 animate-fade-in">
          <p className="font-bold mb-1">Check your email</p>
          <p className="text-sm">{forgotPassword.data.message}</p>
          <Link to="/login" className="btn-primary btn-lg w-full mt-5">Back to sign in</Link>
        </div>
      ) : (
        <>
          {forgotPassword.isError && (
            <ErrorMessage message={getApiErrorMessage(forgotPassword.error)} className="mb-5 animate-scale-in" />
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="parent@example.com"
                className={clsx('input', errors.email && 'input-error')}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={forgotPassword.isPending} className="btn-primary btn-lg w-full">
              {forgotPassword.isPending ? (
                <>
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Sending reset link...
                </>
              ) : 'Send reset link'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-surface-400">
            Remembered it? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
          </p>
        </>
      )}
    </AuthFrame>
  )
}
