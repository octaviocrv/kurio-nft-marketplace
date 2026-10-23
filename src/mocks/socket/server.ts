import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import { getScenario } from '../scenarios'

/**
 * "Servidor" Socket.IO simulado. O MSW intercepta o WebSocket do socket.io-client e o
 * @mswjs/socket.io-binding traduz o protocolo do Socket.IO (handshake e pacotes de evento).
 */
// O MSW remove o prefixo /socket.io/ da URL antes de comparar, então o link é a raiz da própria origem.
// A mesma raiz recebe o WebSocket do HMR do Vite (em dev), que é repassado ao servidor real logo abaixo.
const socketIoLink = ws.link(`${window.location.origin.replace(/^http/, 'ws')}/`)

type MockConnection = ReturnType<typeof toSocketIo>

const connections = new Set<MockConnection>()

// O binding não implementa o heartbeat do Engine.IO. O cliente espera um ping a cada 25 s
// (valor que o próprio binding anuncia no handshake); sem ele, desconecta sozinho em ~30 s.
const PING_INTERVAL_MS = 25_000
const ENGINE_IO_PING = '2'

export const socketHandler = socketIoLink.addEventListener('connection', (connection) => {
  if (!new URL(connection.client.url).pathname.startsWith('/socket.io/')) {
    connection.server.connect() // não é Socket.IO (HMR do Vite): segue para o servidor de verdade
    return
  }

  // Sem conexão também não há socket: o cliente fica tentando reconectar até o cenário mudar
  if (getScenario() === 'offline') {
    connection.client.close()
    return
  }

  const io = toSocketIo(connection)
  connections.add(io)

  const heartbeat = setInterval(() => connection.client.send(ENGINE_IO_PING), PING_INTERVAL_MS)
  connection.client.addEventListener('close', () => {
    clearInterval(heartbeat)
    connections.delete(io)
  })
})

/** Envia um evento para todos os clientes conectados (eventos públicos, como nft.updated). */
export function broadcast(event: string, payload: unknown) {
  connections.forEach((io) => io.client.emit(event, payload))
}

/** Derruba todas as conexões, como uma queda de rede (o socket.io-client tenta reconectar). */
export function disconnectAll() {
  connections.forEach((io) => io.rawClient.close())
}
