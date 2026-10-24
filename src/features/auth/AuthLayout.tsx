import { Link, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { RouteDialog } from '@/components/layout/RouteDialog'
import { TABLET_UP, useMediaQuery } from '@/lib/useMediaQuery'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  mode: 'login' | 'signup'
  title: string
  redirect: string | undefined
  children: ReactNode
  footer: ReactNode
}

/**
 * Moldura de login e cadastro. Mobile: tela cheia. Tablet/desktop: modal sobre o site (Figma),
 * continuando a ser a rota /login ou /cadastro (refresh, link direto e ?redirect= funcionam igual).
 */
export function AuthLayout({ mode, title, redirect, children, footer }: AuthLayoutProps) {
  const isWide = useMediaQuery(TABLET_UP)
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  // Fechar volta para onde a pessoa estava. Rotas privadas trocam a entrada do histórico pelo login
  // (replace), então voltar nunca cai de novo na rota que pediu login. Sem histórico, vai ao início.
  function close() {
    if (canGoBack) router.history.back()
    else void navigate({ to: '/' })
  }

  if (!isWide) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-7 pt-20 pb-10">
        <p aria-hidden className="py-12 text-center text-4xl font-bold tracking-[0.1em]">
          KURIO
        </p>
        <h1 className="mb-10 text-center text-xl font-bold">{title}</h1>
        {children}
        <div className="mt-10 text-center text-sm text-muted-foreground">{footer}</div>
      </main>
    )
  }

  return (
    // O modal abre sobre o próprio site (header e rodapé do layout raiz)
    <main className="min-h-[60vh]">
      <RouteDialog
        title={title}
        hideTitle
        onClose={close}
        description="Entre para gerenciar sua carteira, coleção e perfil de criador."
        header={
          // "Entrar | Criar conta" do Figma: duas rotas, então são links (o atual fica marcado)
          <nav aria-label="Acesso à conta" className="flex items-center justify-center gap-3 text-lg font-bold">
            <AuthTab to="/login" redirect={redirect} active={mode === 'login'}>
              Entrar
            </AuthTab>
            <span aria-hidden className="h-6 w-px bg-primary" />
            <AuthTab to="/cadastro" redirect={redirect} active={mode === 'signup'}>
              Criar conta
            </AuthTab>
          </nav>
        }
      >
        <div className="flex flex-col gap-6 px-2">{children}</div>
        <div className="text-center text-sm text-muted-foreground">{footer}</div>
      </RouteDialog>
    </main>
  )
}

function AuthTab({ to, redirect, active, children }: { to: '/login' | '/cadastro'; redirect: string | undefined; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      search={{ redirect }}
      replace
      aria-current={active ? 'page' : undefined}
      className={cn('rounded-sm outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50', active && 'text-highlight')}
    >
      {children}
    </Link>
  )
}
