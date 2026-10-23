import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { authSearchSchema } from '@/features/auth/authSearch'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { SocialLogin } from '@/features/auth/SocialLogin'

export const Route = createFileRoute('/cadastro')({
  validateSearch: authSearchSchema,
  component: SignUpPage,
})

function SignUpPage() {
  const { redirect } = Route.useSearch()

  return (
    <AuthLayout
      title="Criar perfil de colecionador"
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" search={{ redirect }} className="rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none">
            Entre
          </Link>
        </>
      }
    >
      {/* Fase 1: só o formulário. Validação, conflito de cadastro e envio entram na fase 2. */}
      <form className="flex flex-col gap-3" onSubmit={(event) => event.preventDefault()} noValidate>
        <Label htmlFor="signup-username" className="sr-only">Nome de usuário</Label>
        <Input id="signup-username" autoComplete="username" placeholder="Nome de usuário" />
        <Label htmlFor="signup-email" className="sr-only">E-mail</Label>
        <Input id="signup-email" type="email" autoComplete="email" placeholder="Digite seu e-mail" />
        <Label htmlFor="signup-password" className="sr-only">Senha</Label>
        <PasswordInput id="signup-password" autoComplete="new-password" placeholder="Senha" />
        <Label htmlFor="signup-password-confirm" className="sr-only">Confirmar senha</Label>
        <PasswordInput id="signup-password-confirm" autoComplete="new-password" placeholder="Confirmar senha" />

        <Button type="submit" size="lg" className="mt-7 mb-10 rounded-xl">
          Criar perfil
        </Button>
      </form>

      <SocialLogin />
    </AuthLayout>
  )
}
