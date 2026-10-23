import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createQueryClient } from './lib/queryClient'
import { routeTree } from './routeTree.gen'

const queryClient = createQueryClient()

// URLs legíveis (?rede=ethereum,polygon&min=0.5&pagina=2): todo parâmetro vai como texto puro e
// cada rota converte com zod. O padrão do router serializa em JSON e deixaria "%220.5%22" na barra.
function parseSearch(searchString: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(searchString))
}

function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const query = params.toString().replace(/%2C/g, ',') // vírgula é válida na query: "a,b" fica legível
  return query ? `?${query}` : ''
}

const router = createRouter({
  routeTree,
  parseSearch,
  stringifySearch,
  // Voltar do detalhe para o catálogo devolve a rolagem onde estava
  scrollRestoration: true,
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
