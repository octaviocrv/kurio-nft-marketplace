import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { useEffect } from 'react'
import { socket } from '@/api/socket'
import { EmptyState } from '@/components/EmptyState'
import { getSessionToken } from '@/features/auth/sessionStorage'
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
      <Outlet />
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
