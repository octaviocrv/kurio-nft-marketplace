import { useSyncExternalStore } from 'react'
import { socket } from '@/api/socket'

/** Estado da conexão do socket, para a tela saber quando precisa de um plano B (consulta periódica). */
export function useSocketConnected(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      socket.on('connect', onChange)
      socket.on('disconnect', onChange)
      return () => {
        socket.off('connect', onChange)
        socket.off('disconnect', onChange)
      }
    },
    () => socket.connected,
  )
}
