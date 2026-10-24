import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { nftUpdatedEventSchema, orderUpdatedEventSchema, realtimeEventNames } from '@/api/events'
import { socket } from '@/api/socket'
import type { Session } from '@/api/user'
import { sessionKeys } from '@/features/auth/queries'
import { applyNftEvent, applyOrderEvent, reconcileCartAfterNftEvent } from './applyEvents'
import { createEventGuard } from './eventGuard'

export interface RealtimeNotice {
  id: number
  message: string
}

const NOTICE_DURATION_MS = 10_000

/**
 * Liga o socket ao cache do TanStack Query. Vive no layout raiz, então os listeners nascem com o app
 * e são removidos quando ele desmonta. O REST continua sendo a fonte da verdade: eventos aplicam o
 * que já vem pronto (preço, estoque, pedido) e reconciliam o resto buscando de novo.
 * Retorna o último aviso para a interface anunciar (região aria-live).
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState<RealtimeNotice | null>(null)

  useEffect(() => {
    const accept = createEventGuard()
    let needsReconcile = false
    let noticeCount = 0
    const announce = (message: string) => setNotice({ id: (noticeCount += 1), message })

    function handleNftUpdated(payload: unknown) {
      const event = nftUpdatedEventSchema.safeParse(payload)
      if (!event.success || !accept(event.data)) return
      applyNftEvent(queryClient, event.data)
      void reconcileCartAfterNftEvent(queryClient, event.data.id).then((message) => message && announce(message))
    }

    function handleOrderUpdated(payload: unknown) {
      const event = orderUpdatedEventSchema.safeParse(payload)
      const userId = queryClient.getQueryData<Session>(sessionKeys.current)?.user.id
      if (!event.success || !userId || !accept(event.data)) return
      applyOrderEvent(queryClient, userId, event.data)
    }

    // Queda inesperada (ou tentativa de conexão que falhou): ao voltar, o que foi emitido nesse intervalo
    // se perdeu. Em vez de tentar recuperar evento por evento, busca de novo o que está na tela.
    // "io client disconnect" é o app desconectando de propósito (logout, troca de usuário): não precisa.
    const handleDisconnect = (reason: string) => {
      if (reason !== 'io client disconnect') needsReconcile = true
    }
    const handleConnectError = () => {
      needsReconcile = true
    }
    const handleConnect = () => {
      if (!needsReconcile) return
      needsReconcile = false
      void queryClient.invalidateQueries()
    }

    socket.on(realtimeEventNames.nftUpdated, handleNftUpdated)
    socket.on(realtimeEventNames.orderUpdated, handleOrderUpdated)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('connect', handleConnect)
    return () => {
      socket.off(realtimeEventNames.nftUpdated, handleNftUpdated)
      socket.off(realtimeEventNames.orderUpdated, handleOrderUpdated)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('connect', handleConnect)
    }
  }, [queryClient])

  // O aviso some sozinho; um aviso novo reinicia a contagem
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [notice])

  return { notice, dismissNotice: () => setNotice(null) }
}
