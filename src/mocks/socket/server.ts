import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import { db } from '../db'
import { getScenario } from '../scenarios'

/**
 * "Servidor" Socket.IO simulado. O MSW intercepta o WebSocket do socket.io-client e o
 * @mswjs/socket.io-binding traduz o protocolo do Socket.IO (handshake e pacotes de evento).
 */
// O MSW remove o prefixo /socket.io/ da URL antes de comparar, então o link é a raiz da própria origem.
// A mesma raiz recebe o WebSocket do HMR do Vite (em dev), que é repassado ao servidor real logo abaixo.
const socketIoLink = ws.link(`${window.location.origin.replace(/^http/, 'ws')}/`)

type MockConnection = ReturnType<typeof toSocketIo>

/** Uma conexão aberta e o token que o cliente mandou no handshake (null = visitante). */
interface MockClient {
  io: MockConnection
  token: string | null
}

const clients = new Set<MockClient>()

// O binding não implementa o heartbeat do Engine.IO. O cliente espera um ping a cada 25 s
// (valor que o próprio binding anuncia no handshake); sem ele, desconecta sozinho em ~30 s.
const PING_INTERVAL_MS = 25_000
const ENGINE_IO_PING = '2'

// "4" = mensagem do Engine.IO, "0" = pacote CONNECT do Socket.IO. O que vem depois é o JSON do `auth`.
const SOCKET_IO_CONNECT_PREFIX = '40'

function readAuthToken(authJson: string): string | null {
  try {
    const auth: unknown = JSON.parse(authJson)
    const token = typeof auth === 'object' && auth !== null ? (auth as { token?: unknown }).token : null
    return typeof token === 'string' ? token : null
  } catch {
    return null
  }
}

/** Dono da conexão, conferido a cada envio: sessão encerrada ou expirada deixa de receber eventos privados. */
function userIdOf(client: MockClient): string | null {
  const session = client.token ? db.sessions[client.token] : undefined
  return session && Date.parse(session.expiresAt) > Date.now() ? session.userId : null
}

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

  const client: MockClient = { io: toSocketIo(connection), token: null }
  clients.add(client)

  // O binding aprova o namespace sem olhar o `auth`. O token chega no pacote CONNECT do cliente;
  // sem lê-lo não dá para saber de quem é a conexão, e eventos privados (pedido) iriam para todos.
  connection.client.addEventListener('message', (event) => {
    if (typeof event.data !== 'string' || !event.data.startsWith(SOCKET_IO_CONNECT_PREFIX)) return
    client.token = readAuthToken(event.data.slice(SOCKET_IO_CONNECT_PREFIX.length))
  })

  const heartbeat = setInterval(() => connection.client.send(ENGINE_IO_PING), PING_INTERVAL_MS)
  connection.client.addEventListener('close', () => {
    clearInterval(heartbeat)
    clients.delete(client)
  })
})

/** Envia um evento para todos os clientes conectados, inclusive visitantes (eventos públicos, como nft.updated). */
export function broadcast(event: string, payload: unknown) {
  clients.forEach((client) => client.io.client.emit(event, payload))
}

/** Envia só às conexões autenticadas como esse usuário (eventos privados, como order.updated). */
export function emitToUser(userId: string, event: string, payload: unknown) {
  clients.forEach((client) => {
    if (userIdOf(client) === userId) client.io.client.emit(event, payload)
  })
}

/** Derruba todas as conexões, como uma queda de rede (o socket.io-client tenta reconectar). */
export function disconnectAll() {
  clients.forEach((client) => client.io.rawClient.close())
}
