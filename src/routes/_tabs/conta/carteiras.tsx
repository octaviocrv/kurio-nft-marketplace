import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'

export const Route = createFileRoute('/_tabs/conta/carteiras')({
  component: WalletsPage,
})

// TEMPORÁRIO (1.7 Pagamento): existe para o menu da carteira já navegar. Conteúdo na tela de Carteiras.
function WalletsPage() {
  return <PageHeader title="Carteiras" />
}
