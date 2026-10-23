import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'

export const Route = createFileRoute('/nft/$nftId')({
  component: NftDetailPage,
})

// TEMPORÁRIO (1.7 Início): existe para os cards já navegarem. A tela de detalhe é a próxima.
function NftDetailPage() {
  return <PageHeader />
}
