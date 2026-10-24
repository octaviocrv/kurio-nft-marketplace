/**
 * Latências do cenário `flaky`. Cada URL tem uma latência fixa (hash do caminho + parâmetros em ordem),
 * então URLs diferentes chegam fora de ordem sempre do mesmo jeito, mesmo com requisições em paralelo.
 * Antes era um contador global, e a ordem dependia de quantas requisições o app fez antes.
 * Módulo puro: os testes usam a mesma função para saber qual resposta deve chegar primeiro.
 */
export const FLAKY_LATENCIES_MS = [1200, 150, 700, 300] as const

export function flakyLatency(requestUrl: string): number {
  const url = new URL(requestUrl, 'http://localhost')
  const params = [...url.searchParams.entries()].sort().map(([name, value]) => `${name}=${value}`)
  const key = `${url.pathname}?${params.join('&')}`
  const hash = [...key].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0)
  return FLAKY_LATENCIES_MS[hash % FLAKY_LATENCIES_MS.length]!
}
