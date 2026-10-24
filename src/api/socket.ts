import type { Socket } from 'socket.io-client'

/**
 * Cliente Socket.IO único do app (mesma origem, caminho padrão /socket.io).
 * Só WebSocket: o MSW intercepta WebSocket, mas não o long-polling HTTP que o Socket.IO
 * tenta primeiro por padrão. Com um backend real, ir direto de WebSocket também é o recomendado.
 * A conexão é aberta pelo layout raiz, e não aqui, para respeitar o ciclo de vida da tela.
 */
// Inicializada pelo bootstrap somente depois que o MSW intercepta WebSocket. Manter o import do
// socket.io-client fora deste módulo permite baixar e avaliar o restante do app em paralelo ao
// service worker, sem o cliente capturar o WebSocket nativo cedo demais.
export let socket: Socket

export async function initializeSocket(): Promise<void> {
  if (socket) return
  const { io } = await import('socket.io-client')
  socket = io({
    autoConnect: false,
    transports: ['websocket'],
    // Reconexão mais curta que o padrão (até 5 s): uma queda passa a ser recuperada em poucos segundos
    reconnectionDelay: 500,
    reconnectionDelayMax: 2000,
  })
}
