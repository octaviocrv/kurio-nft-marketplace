import { z } from 'zod'
import { readStorage, writeStorage } from './storage'

/**
 * Cenários da API simulada, escolhidos por ?scenario= na URL ou pelo painel e lembrados no
 * localStorage (sobrevivem ao refresh). Todos determinísticos: o mesmo cenário se comporta igual
 * em toda execução. Os cenários de um recurso específico (vazio, sessão expirada, pagamento recusado,
 * timeout do pedido, mudança de preço) entram junto com o handler do recurso.
 */
export const scenarioSchema = z.enum(['default', 'slow', 'flaky', 'offline', 'error-5xx', 'empty'])
export type Scenario = z.infer<typeof scenarioSchema>

export const scenarioLabels: Record<Scenario, { title: string; description: string }> = {
  default: { title: 'Padrão', description: 'API respondendo normalmente.' },
  slow: { title: 'Lento', description: 'Toda requisição demora 2,5 s (mostra os skeletons).' },
  flaky: { title: 'Instável', description: 'Latência variável: respostas chegam fora de ordem.' },
  offline: { title: 'Sem conexão', description: 'Nenhuma requisição chega e o socket cai.' },
  'error-5xx': { title: 'Erro no servidor', description: 'Toda requisição responde 503.' },
  empty: { title: 'Catálogo vazio', description: 'A listagem de NFTs responde sem nenhum item.' },
}

const STORAGE_KEY = 'mock-scenario'
let currentScenario: Scenario = 'default'

/** Chamado uma vez ao ligar os mocks: a URL tem prioridade sobre o que estava salvo. */
export function loadScenario() {
  const url = new URL(window.location.href)
  const fromUrl = scenarioSchema.safeParse(url.searchParams.get('scenario'))
  const fromStorage = scenarioSchema.safeParse(readStorage(STORAGE_KEY))
  currentScenario = fromUrl.success ? fromUrl.data : fromStorage.success ? fromStorage.data : 'default'
  writeStorage(STORAGE_KEY, currentScenario)

  // Tira o parâmetro da URL depois de lido: daqui em diante vale o salvo. Se ficasse, ele venceria
  // o painel e o reset no próximo reload (e as rotas não precisam saber dele).
  if (url.searchParams.has('scenario')) {
    url.searchParams.delete('scenario')
    window.history.replaceState(window.history.state, '', url)
  }
}

export function getScenario(): Scenario {
  return currentScenario
}

export function saveScenario(scenario: Scenario) {
  currentScenario = scenario
  writeStorage(STORAGE_KEY, scenario)
}
