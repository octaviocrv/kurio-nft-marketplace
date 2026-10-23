import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

export const Route = createRootRoute({
  component: RootLayout,
  // Qualquer URL que não bate com nenhuma rota cai aqui (requisito: tratar rotas inexistentes)
  notFoundComponent: PageNotFound,
})

function RootLayout() {
  return <Outlet />
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
