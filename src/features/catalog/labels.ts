import type { NftCategory } from '@/api/nft'
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

export const sortOptions = [
  { value: 'recentes', label: 'Listados recentemente' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'populares', label: 'Mais favoritados' },
] as const
