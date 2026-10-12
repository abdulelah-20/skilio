import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { clsx } from 'clsx'

import { useResetPassword } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/api/client'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner'
import { AuthFrame } from './AuthFrame'

interface FormValues {
  password: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const resetPassword = useResetPassword()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>()
  const password = watch('password', '')

  function onSubmit(values: FormValues) {
    resetPassword.mutate({ token, password: values.password })
  }

  return (
    <AuthFrame
      eyebrow="Secure reset"
      title="Create a new password"
      subtitle="Choose a strong password to protect your parent account."
    >
      {!token ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-bold mb-1">Reset link missing</p>
          <p className="text-sm mb-5">Request a fresh password reset link to continue.</p>
          <Link to="/forgot-password" className="btn-primary btn-lg w-full">Request new link</Link>
        </div>
      ) : (
        <>
          {resetPassword.isError && (
            <ErrorMessage message={getApiErrorMessage(resetPassword.error)} className="mb-5 animate-scale-in" />
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="password" className="label">New password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={clsx('input', errors.password && 'input-error')}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Must be at least 8 characters' },
                  validate: {
                    hasLetter: (v) => /[a-zA-Z]/.test(v) || 'Must contain at least one letter',
                    hasNumber: (v) => /[0-9]/.test(v) || 'Must contain at least one number',
                  },
                })}
              />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={clsx('input', errors.confirmPassword && 'input-error')}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
            </div>
            {password.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                <Strength label="8+ chars" met={password.length >= 8} />
                <Strength label="Letter" met={/[a-zA-Z]/.test(password)} />
                <Strength label="Number" met={/[0-9]/.test(password)} />
              </div>
            )}
            <button type="submit" disabled={resetPassword.isPending} className="btn-primary btn-lg w-full">
              {resetPassword.isPending ? (
                <>
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Updating...
                </>
              ) : 'Update password'}
            </button>
          </form>
        </>
      )}
    </AuthFrame>
  )
}

function Strength({ label, met }: { label: string; met: boolean }) {
  return (
    <span className={clsx('text-xs font-bold px-2.5 py-2 rounded-xl text-center', met ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-400')}>
      {met ? '✓ ' : ''}{label}
    </span>
  )
}
