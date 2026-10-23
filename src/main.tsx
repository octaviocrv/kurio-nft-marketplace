import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createQueryClient } from './lib/queryClient'
import { routeTree } from './routeTree.gen'
// Fonte local (sem Google Fonts): só os 3 pesos do Figma e só o subset latin, que cobre o português
import '@fontsource/roboto-mono/latin-400.css'
import '@fontsource/roboto-mono/latin-500.css'
import '@fontsource/roboto-mono/latin-700.css'
import './index.css'

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

// Mocks ligados por padrão: a entrega não tem backend real, então o build de demonstração também usa o MSW.
// VITE_ENABLE_MOCKS=false desliga (o app passa a chamar um /api de verdade).
const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS !== 'false'

async function startMocks() {
  if (!mocksEnabled) return
  // Import dinâmico: o MSW fica num chunk separado e não pesa no bundle principal
  const { startMockWorker } = await import('./mocks/browser')
  await startMockWorker()
}

// Só renderiza depois do worker pronto: senão as primeiras requisições escapariam do mock
startMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
