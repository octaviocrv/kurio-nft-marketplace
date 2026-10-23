import type { CartItem } from '@/api/cart'
import { nfts } from './nfts'

/**
 * Carrinho de demonstração da fase 1 (4 NFTs, primeira edição com estoque de cada).
 * Serve só para carrinho e checkout terem conteúdo; na fase 2 o carrinho vive no mock da API.
 */
export const demoCartItems: CartItem[] = nfts.slice(0, 4).map((nft, index) => {
  const edition = nft.editions.find((item) => item.available > 0) ?? nft.editions[0]!
  return {
    id: `demo-item-${index}`,
    nftId: nft.id,
    editionId: edition.id,
    quantity: 1,
    name: nft.name,
    image: nft.images[0]!,
    editionLabel: edition.label,
    unitPrice: nft.price,
    available: edition.available,
  }
})

export const DEMO_NETWORK_FEE = '0.016'
