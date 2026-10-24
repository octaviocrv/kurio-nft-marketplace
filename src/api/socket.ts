import { io } from 'socket.io-client'

/**
 * Cliente Socket.IO único do app (mesma origem, caminho padrão /socket.io).
 * Só WebSocket: o MSW intercepta WebSocket, mas não o long-polling HTTP que o Socket.IO
 * tenta primeiro por padrão. Com um backend real, ir direto de WebSocket também é o recomendado.
 * A conexão é aberta pelo layout raiz, e não aqui, para respeitar o ciclo de vida da tela.
 */
export const socket = io({
  autoConnect: false,
  transports: ['websocket'],
  // Reconexão mais curta que o padrão (até 5 s): uma queda passa a ser recuperada em poucos segundos
  reconnectionDelay: 500,
  reconnectionDelayMax: 2000,
})
