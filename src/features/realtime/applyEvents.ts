import type { QueryClient } from '@tanstack/react-query'
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/api/events'
import type { Cart, CartItem } from '@/api/cart'
import type { Nft, NftPage } from '@/api/nft'
import type { Order } from '@/api/order'
import { cartKeys, quoteKeys } from '@/features/cart/queries'
import { nftKeys } from '@/features/nft/queries'
import { orderKeys } from '@/features/order/queries'
import { formatEth, parseEth } from '@/lib/eth'

/** Só substitui o que está no cache se o evento for mais novo: o REST pode ter chegado antes dele. */
function patchNft(nft: Nft, event: NftUpdatedEvent): Nft {
  return nft.version >= event.version ? nft : { ...nft, ...event.data, version: event.version }
}

/**
 * Preço e estoque novos entram direto no detalhe e nas listas em cache (a tela muda na hora).
 * As listas ficam marcadas como velhas, sem refetch: filtro e ordenação por preço podem ter
 * mudado de resultado, e a próxima visita busca a lista certa no REST.
 */
export function applyNftEvent(queryClient: QueryClient, event: NftUpdatedEvent) {
  queryClient.setQueryData<Nft>(nftKeys.detail(event.id), (nft) => nft && patchNft(nft, event))
  queryClient.setQueriesData<NftPage>({ queryKey: nftKeys.lists() }, (page) =>
    page && { ...page, items: page.items.map((nft) => (nft.id === event.id ? patchNft(nft, event) : nft)) },
  )
  void queryClient.invalidateQueries({ queryKey: nftKeys.lists(), refetchType: 'none' })
}

function cartItemsOfNft(queryClient: QueryClient, nftId: string): CartItem[] {
  return queryClient.getQueriesData<Cart>({ queryKey: cartKeys.all }).flatMap(([, cart]) => cart?.items.filter((item) => item.nftId === nftId) ?? [])
}

/** Texto do aviso, só com o que mudou por fora. Item cuja quantidade mudou foi mexido pelo próprio usuário (ex.: compra). */
function describeCartChanges(before: CartItem[], after: CartItem[]): string | null {
  const messages = after.flatMap((item) => {
    const previous = before.find((candidate) => candidate.id === item.id)
    if (!previous || previous.quantity !== item.quantity) return []
    const changes: string[] = []
    if (previous.unitPrice !== item.unitPrice) {
      changes.push(`O preço de ${item.name} mudou de ${formatEth(parseEth(previous.unitPrice))} ETH para ${formatEth(parseEth(item.unitPrice))} ETH.`)
    }
    if (previous.available !== item.available) {
      changes.push(
        item.available === 0
          ? `${item.name} (${item.editionLabel}) esgotou.`
          : `A disponibilidade de ${item.name} (${item.editionLabel}) mudou: restam ${item.available}.`,
      )
    }
    return changes
  })
  return messages.length > 0 ? messages.join(' ') : null
}

/**
 * O carrinho e a cotação dependem de cálculo do servidor (preço atual, estoque, taxa), então o evento
 * só dispara a reconciliação: busca o carrinho de novo no REST e a cotação acompanha. Enquanto a cotação
 * recarrega, o checkout mantém "Confirmar" bloqueado. Retorna o aviso, ou null se nada mudou para o usuário.
 */
export async function reconcileCartAfterNftEvent(queryClient: QueryClient, nftId: string): Promise<string | null> {
  const before = cartItemsOfNft(queryClient, nftId)
  if (before.length === 0) return null

  await queryClient.invalidateQueries({ queryKey: cartKeys.all, refetchType: 'all' })
  void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
  return describeCartChanges(before, cartItemsOfNft(queryClient, nftId))
}

/** Só atualiza pedido que o usuário atual já tem em cache, e só se a versão for maior. */
export function applyOrderEvent(queryClient: QueryClient, userId: string, event: OrderUpdatedEvent) {
  queryClient.setQueryData<Order>(orderKeys.detail(userId, event.id), (order) => (order && order.version < event.version ? event.data : order))
  // Pedido confirmado tira itens do carrinho e baixa o estoque. A chave de tentativa NÃO é limpa aqui:
  // quem ainda não viu o pedido (timeout) precisa dela para recuperá-lo; a tela do pedido limpa ao chegar nele.
  if (event.data.status !== 'pending') {
    void queryClient.invalidateQueries({ queryKey: cartKeys.all })
    void queryClient.invalidateQueries({ queryKey: nftKeys.all })
  }
}
