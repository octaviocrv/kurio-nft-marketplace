import { delay, http, HttpResponse } from 'msw'
import { errorResponse } from '../http'
import { flakyLatency } from '../flakyLatency'
import { getScenario } from '../scenarios'

const DEFAULT_LATENCY_MS = 150 // rede rápida, mas não instantânea: o estado de carregamento existe de verdade
const SLOW_LATENCY_MS = 2500
/**
 * Primeiro handler da lista: aplica a condição de rede do cenário a toda chamada /api.
 * Quando não devolve resposta, o MSW segue para o handler do recurso.
 */
export const networkConditionsHandler = http.all('/api/*', async ({ request }) => {
  const scenario = getScenario()

  if (scenario === 'offline') return HttpResponse.error() // o Axios recebe como falha de rede

  if (scenario === 'slow') await delay(SLOW_LATENCY_MS)
  else if (scenario === 'flaky') await delay(flakyLatency(request.url))
  else await delay(DEFAULT_LATENCY_MS)

  if (scenario === 'error-5xx') {
    return errorResponse(503, { code: 'server_error', message: 'Serviço temporariamente indisponível. Tente novamente.' })
  }
})
