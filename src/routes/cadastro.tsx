import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { registerInputSchema, type RegisterInput } from '@/api/auth'
import { ApiError } from '@/api/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { authSearchSchema } from '@/features/auth/authSearch'
import { FieldError } from '@/features/auth/FieldError'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { useRegister } from '@/features/auth/queries'
import { SocialLogin } from '@/features/auth/SocialLogin'

export const Route = createFileRoute('/cadastro')({
  validateSearch: authSearchSchema,
  component: SignUpPage,
})

function SignUpPage() {
  const { redirect } = Route.useSearch()
  const navigate = Route.useNavigate()
  const signUp = useRegister()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerInputSchema) })

  async function submit(input: RegisterInput) {
    try {
      await signUp.mutateAsync(input)
      await navigate({ href: redirect ?? '/', replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const fields = error.fieldErrors
        if (fields?.username) setError('username', { message: fields.username }, { shouldFocus: true })
        if (fields?.email) setError('email', { message: fields.email }, { shouldFocus: !fields.username })
        if (fields?.password) setError('password', { message: fields.password }, { shouldFocus: !fields.username && !fields.email })
        if (fields?.confirmPassword) setError('confirmPassword', { message: fields.confirmPassword })
        if (!fields || Object.keys(fields).length === 0) setError('root', { message: error.message })
      }
    }
  }

  return (
    <AuthLayout
      mode="signup"
      redirect={redirect}
      title="Criar perfil de colecionador"
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" search={{ redirect }} replace className="rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none">
            Entre
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(submit)} noValidate>
        <Label htmlFor="signup-username" className="sr-only">Nome de usuário</Label>
        <Input
          id="signup-username"
          autoComplete="username"
          placeholder="Nome de usuário"
          aria-invalid={errors.username ? true : undefined}
          aria-describedby={errors.username ? 'signup-username-error' : undefined}
          {...register('username')}
        />
        <FieldError id="signup-username-error" message={errors.username?.message} />
        <Label htmlFor="signup-email" className="sr-only">E-mail</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'signup-email-error' : undefined}
          {...register('email')}
        />
        <FieldError id="signup-email-error" message={errors.email?.message} />
        <Label htmlFor="signup-password" className="sr-only">Senha</Label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          placeholder="Senha"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? 'signup-password-error' : undefined}
          {...register('password')}
        />
        <FieldError id="signup-password-error" message={errors.password?.message} />
        <Label htmlFor="signup-password-confirm" className="sr-only">Confirmar senha</Label>
        <PasswordInput
          id="signup-password-confirm"
          autoComplete="new-password"
          placeholder="Confirmar senha"
          aria-invalid={errors.confirmPassword ? true : undefined}
          aria-describedby={errors.confirmPassword ? 'signup-password-confirm-error' : undefined}
          {...register('confirmPassword')}
        />
        <FieldError id="signup-password-confirm-error" message={errors.confirmPassword?.message} />

        {errors.root?.message && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.root.message}</p>}

        <Button type="submit" size="lg" className="mt-7 mb-10 rounded-xl" disabled={signUp.isPending}>
          {signUp.isPending ? 'Criando perfil...' : 'Criar perfil'}
        </Button>
      </form>

      <SocialLogin />
    </AuthLayout>
  )
}
