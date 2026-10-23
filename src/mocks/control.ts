import { buildEventId, realtimeEventNames, type NftUpdatedEvent } from '@/api/events'
import type { Nft } from '@/api/nft'
import { db, saveDb } from './db'
import { saveScenario, type Scenario } from './scenarios'
import { broadcast, disconnectAll } from './socket/server'
import { clearAllStorage } from './storage'

/*
 * Controles "de fora" da API simulada: usados pelo painel de cenários e pelos testes Playwright
 * (via window.__kurioMock). Mudam o dado NO MOCK, que passa a responder diferente no REST
 * e emite o evento correspondente pelo Socket.IO. A UI nunca é tocada diretamente.
 */

type NftChange = Partial<Pick<Nft, 'price' | 'previousPrice' | 'editions'>>

/** Muda preço/estoque de um NFT, sobe a versão e avisa os clientes conectados (nft.updated). */
export function updateNft(nftId: string, change: NftChange) {
  const nft = db.nfts.find((item) => item.id === nftId)
  if (!nft) throw new Error(`NFT inexistente no mock: ${nftId}`)

  Object.assign(nft, change)
  nft.version += 1
  saveDb()

  const event: NftUpdatedEvent = {
    eventId: buildEventId('nft', nft.id, nft.version),
    resource: 'nft',
    id: nft.id,
    version: nft.version,
    data: { price: nft.price, previousPrice: nft.previousPrice, editions: nft.editions },
  }
  broadcast(realtimeEventNames.nftUpdated, event)
  return event
}

export function setScenario(scenario: Scenario) {
  saveScenario(scenario)
  if (scenario === 'offline') disconnectAll()
}

/** Volta ao cenário conhecido: apaga banco, cenário e sessão salvos e recarrega com o seed. */
export function resetMocks() {
  clearAllStorage()
  window.location.reload()
}

/** Reenvia um evento já emitido (testes de duplicata e de evento antigo). */
export function replayEvent(eventName: string, event: unknown) {
  broadcast(eventName, event)
}

const mockControls = { updateNft, setScenario, resetMocks, replayEvent, disconnectAll }

declare global {
  interface Window {
    __kurioMock?: typeof mockControls
  }
}

export function exposeMockControls() {
  window.__kurioMock = mockControls
}
