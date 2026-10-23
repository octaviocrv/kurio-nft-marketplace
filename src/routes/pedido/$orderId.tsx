import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'

export const Route = createFileRoute('/pedido/$orderId')({
  component: OrderPage,
})

// TEMPORÁRIO (1.7 Pagamento): existe para o "Confirmar compra" já navegar. Conteúdo na tela de Confirmação.
function OrderPage() {
  return <PageHeader title="Pedido" />
}
