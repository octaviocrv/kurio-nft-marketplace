import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createQueryClient } from './lib/queryClient'
import { routeTree } from './routeTree.gen'

const queryClient = createQueryClient()

const router = createRouter({
  routeTree,
  // O queryClient entra no contexto para beforeLoad/loader das rotas (ex.: checar sessão antes de abrir rota privada)
  context: { queryClient },
  // Quem guarda dado em cache é o TanStack Query; o router sempre chama o loader e deixa o Query decidir
  defaultPreloadStaleTime: 0,
})

// Registra o router no TypeScript: links e params passam a ser tipados em todo o app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
