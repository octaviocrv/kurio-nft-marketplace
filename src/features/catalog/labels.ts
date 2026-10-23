import type { NftCategory, NftSort } from '@/api/nft'
import type { Network } from '@/api/shared'

// Textos da interface para os valores do contrato (que ficam em slug na API e na URL).

export const categoryLabels: Record<NftCategory, string> = {
  'arte-digital': 'Arte digital',
  fotografia: 'Fotografia',
  musica: 'Música',
  'arte-3d': 'Arte 3D',
  colecionaveis: 'Colecionáveis',
  generativa: 'Generativa',
  jogos: 'Jogos',
  assinaturas: 'Assinaturas',
  utilidade: 'Utilidade',
}

export const networkLabels: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

export const sortLabels: Record<NftSort, string> = {
  padrao: 'Padrão',
  recentes: 'Novos lançamentos',
  populares: 'Mais favoritados',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
}
