import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { authSearchSchema } from '@/features/auth/authSearch'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { SocialLogin } from '@/features/auth/SocialLogin'

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()

  return (
    <AuthLayout
      title="Entrar"
      footer={
        <>
          Novo na Kurio?{' '}
          {/* Leva o redirect junto: quem cria conta no meio da compra volta para a compra */}
          <Link to="/cadastro" search={{ redirect }} className="rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none">
            Crie uma conta
          </Link>
        </>
      }
    >
      {/* Fase 1: só o formulário. Validação (zod + react-hook-form) e envio entram na fase 2. */}
      <form className="flex flex-col gap-3" onSubmit={(event) => event.preventDefault()} noValidate>
        {/* Rótulos só para leitor de tela: o Figma usa placeholder, mas placeholder some ao digitar */}
        <Label htmlFor="login-email" className="sr-only">E-mail</Label>
        <Input id="login-email" type="email" autoComplete="email" placeholder="contato@email.com" />
        <Label htmlFor="login-password" className="sr-only">Senha</Label>
        <PasswordInput id="login-password" autoComplete="current-password" placeholder="Senha" />

        <button
          type="button"
          disabled
          title="Indisponível na demo"
          className="self-end text-sm text-highlight disabled:cursor-not-allowed disabled:opacity-60"
        >
          Esqueceu a senha?<span className="sr-only"> (indisponível na demo)</span>
        </button>

        <Button type="submit" size="lg" className="mt-7 mb-10 rounded-xl">
          Entrar
        </Button>
      </form>

      <SocialLogin />
    </AuthLayout>
  )
}
