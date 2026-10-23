import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

// TEMPORÁRIO (1.7 Carrinho): existe para o "Conectar e finalizar" já navegar. A tela de pagamento é a próxima.
function CheckoutPage() {
  return <PageHeader title="Pagamento com carteira" fallbackTo="/carrinho" />
}
