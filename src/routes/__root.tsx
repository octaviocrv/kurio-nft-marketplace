import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { useEffect } from 'react'
import { socket } from '@/api/socket'
import { EmptyState } from '@/components/EmptyState'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useOptionalSession } from '@/features/auth/queries'
import { getSessionToken } from '@/features/auth/sessionStorage'
import { useCart } from '@/features/cart/queries'
import { useCartOwnerId } from '@/features/cart/useCartOwnerId'
import { RealtimeNotice } from '@/features/realtime/RealtimeNotice'
import { useRealtimeSync } from '@/features/realtime/useRealtimeSync'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  // Qualquer URL que não bate com nenhuma rota cai aqui (requisito: tratar rotas inexistentes)
  notFoundComponent: PageNotFound,
})

function RootLayout() {
  const { notice, dismissNotice } = useRealtimeSync()
  const navigate = useNavigate()
  const { pathname, href } = useLocation()
  const session = useOptionalSession()
  const cart = useCart(useCartOwnerId())

  // undefined enquanto a sessão salva ainda não respondeu; null = visitante
  const user = session.data?.user ?? (getSessionToken() !== null && session.isPending ? undefined : null)
  const cartItemCount = cart.data?.items.reduce((total, item) => total + item.quantity, 0)
  const isAuthPage = pathname === '/login' || pathname === '/cadastro'

  function handleSearch(busca: string | undefined) {
    // No Início a busca mantém os filtros aplicados; vinda de outra tela, começa do zero
    void navigate({ to: '/', search: (previous) => ({ ...(pathname === '/' ? previous : {}), busca, pagina: undefined }) })
  }

  // Tempo real vale para o app inteiro (catálogo, carrinho, pedido): conecta com o app e libera ao desmontar
  useEffect(() => {
    const token = getSessionToken()
    socket.auth = token ? { token } : {}
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <>
      <SiteHeader
        pathname={pathname}
        user={user}
        cartItemCount={cartItemCount}
        loginRedirect={isAuthPage ? undefined : href}
        onSearch={handleSearch}
      />
      <Outlet />
      <SiteFooter />
      <RealtimeNotice notice={notice} onDismiss={dismissNotice} />
    </>
  )
}

function PageNotFound() {
  return (
    <main className="flex min-h-dvh flex-col">
      <EmptyState
        icon={<Compass />}
        title="Página não encontrada"
        description="O endereço pode estar errado ou a página não existe mais."
        action={{ label: 'Voltar ao início', to: '/' }}
      />
    </main>
  )
}
