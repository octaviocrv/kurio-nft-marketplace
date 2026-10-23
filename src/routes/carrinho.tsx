import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

// TEMPORÁRIO (tarefa 1.6): só o cabeçalho, para a navegação funcionar. Conteúdo na 1.7.
function CartPage() {
  return <PageHeader title="Carrinho de NFTs" />
}
