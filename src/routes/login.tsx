import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { loginInputSchema, type LoginInput } from '@/api/auth'
import { ApiError } from '@/api/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { authSearchSchema } from '@/features/auth/authSearch'
import { FieldError } from '@/features/auth/FieldError'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { useLogin } from '@/features/auth/queries'
import { SocialLogin } from '@/features/auth/SocialLogin'

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  const navigate = Route.useNavigate()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginInputSchema) })

  async function submit(input: LoginInput) {
    try {
      await login.mutateAsync(input)
      await navigate({ href: redirect ?? '/', replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors?.email) setError('email', { message: error.fieldErrors.email }, { shouldFocus: true })
        if (error.fieldErrors?.password) setError('password', { message: error.fieldErrors.password }, { shouldFocus: !error.fieldErrors.email })
        if (!error.fieldErrors || Object.keys(error.fieldErrors).length === 0) setError('root', { message: error.message })
      }
    }
  }

  return (
    <AuthLayout
      mode="login"
      redirect={redirect}
      title="Entrar"
      footer={
        <>
          Novo na Kurio?{' '}
          {/* Leva o redirect junto: quem cria conta no meio da compra volta para a compra */}
          <Link to="/cadastro" search={{ redirect }} replace className="rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none">
            Crie uma conta
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(submit)} noValidate>
        {/* Rótulos só para leitor de tela: o Figma usa placeholder, mas placeholder some ao digitar */}
        <Label htmlFor="login-email" className="sr-only">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="contato@email.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email')}
        />
        <FieldError id="login-email-error" message={errors.email?.message} />
        <Label htmlFor="login-password" className="sr-only">Senha</Label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="Senha"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          {...register('password')}
        />
        <FieldError id="login-password-error" message={errors.password?.message} />

        <button
          type="button"
          disabled
          title="Indisponível na demo"
          className="self-end text-sm text-highlight disabled:cursor-not-allowed disabled:opacity-60"
        >
          Esqueceu a senha?<span className="sr-only"> (indisponível na demo)</span>
        </button>

        {errors.root?.message && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.root.message}</p>}

        <Button type="submit" size="lg" className="mt-7 mb-10 rounded-xl" disabled={login.isPending}>
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <SocialLogin />
    </AuthLayout>
  )
}
