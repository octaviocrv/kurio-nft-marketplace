import type { Order, OrderItem } from '@/api/order'
import { multiplyWei, parseEth, sumWei, toEthString } from '@/lib/eth'
import { DEMO_NETWORK_FEE, demoCartItems } from './carts'
import { nfts } from './nfts'
import { walletsByUserId } from './users'

/*
 * Pedidos de demonstração da fase 1, um por status (o enunciado pede os três):
 *   /pedido/ord-1001 — confirmado (recibo completo)
 *   /pedido/ord-1002 — pendente
 *   /pedido/ord-1003 — recusado
 * Valores calculados a partir dos itens (nunca digitados), em bigint.
 */

const wallet = walletsByUserId['user-nova']![0]!

const items: OrderItem[] = demoCartItems.map((cartItem) => {
  const nft = nfts.find((item) => item.id === cartItem.nftId)!
  return {
    nftId: cartItem.nftId,
    editionId: cartItem.editionId,
    name: cartItem.name,
    tokenId: nft.tokenId,
    image: cartItem.image,
    editionLabel: cartItem.editionLabel,
    quantity: cartItem.quantity,
    unitPrice: cartItem.unitPrice,
    subtotal: toEthString(multiplyWei(parseEth(cartItem.unitPrice), cartItem.quantity)),
  }
})

const subtotalWei = sumWei(items.map((item) => parseEth(item.subtotal)))

const base = {
  createdAt: '2026-10-23T14:30:00.000Z',
  items,
  subtotal: toEthString(subtotalWei),
  discount: '0',
  networkFee: DEMO_NETWORK_FEE,
  total: toEthString(subtotalWei + parseEth(DEMO_NETWORK_FEE)),
  couponCode: null,
  walletAddress: wallet.address,
  walletProvider: wallet.provider,
  network: wallet.network,
}

export const demoOrders: Order[] = [
  {
    ...base,
    id: 'ord-1001',
    status: 'confirmed',
    confirmedAt: '2026-10-23T14:30:42.000Z',
    transactionHash: '0xa91f3c7e5d2b8a6f4e1c9d0b7a3f5e2c8d6b4a1f9e7c5d3b2a0f8e6d4c2be82c',
  },
  { ...base, id: 'ord-1002', status: 'pending' },
  { ...base, id: 'ord-1003', status: 'rejected', rejectionReason: 'Transação recusada pela carteira.' },
]
