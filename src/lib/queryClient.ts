import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/error'

// Todo erro de query/mutation é ApiError (o interceptor do Axios garante): tipa `error` no app inteiro
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}

const MAX_RETRIES = 2

/**
 * Política de cache e retry (documentada em docs/projeto/decisoes.md):
 * - staleTime 30s: navegar entre telas não refaz a mesma consulta; eventos do socket
 *   e mutations invalidam o que mudou, então o dado não fica velho esperando o tempo passar.
 * - Retry só em falha transitória (rede, timeout, 5xx), no máximo 2 vezes com backoff.
 *   4xx não repete: validação, sessão, 404 e conflito dariam o mesmo resultado.
 * - Mutations nunca repetem sozinhas: repetir um POST pode duplicar a operação.
 *   O pedido tem retry próprio, com chave de idempotência.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.isClientError) return false
          return failureCount < MAX_RETRIES
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
