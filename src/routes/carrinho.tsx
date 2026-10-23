import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { CartItemCard } from '@/features/cart/CartItemCard'
import { CartSummary } from '@/features/cart/CartSummary'
import { multiplyWei, parseEth, sumWei, toEthString } from '@/lib/eth'
import { DEMO_NETWORK_FEE, demoCartItems } from '@/mocks/fixtures/carts' // fase 1: vira hook de Query na fase 2

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

// Fase 1: totais calculados aqui só para a tela reagir. Na fase 2 quem calcula é a cotação da API.

function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(demoCartItems)

  const subtotalWei = sumWei(items.map((item) => multiplyWei(parseEth(item.unitPrice), item.quantity)))
  const feeWei = parseEth(DEMO_NETWORK_FEE)

  function changeQuantity(itemId: string, quantity: number) {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }

  if (items.length === 0) return <EmptyCart />

  return (
    <>
      <PageHeader title="Carrinho de NFTs" />
      {/* Espaço no fim para o resumo fixo não cobrir o último item */}
      <main className="mx-auto max-w-md px-6 pb-[calc(24rem+env(safe-area-inset-bottom))]">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <CartItemCard item={item} onQuantityChange={changeQuantity} onRemove={removeItem} />
            </li>
          ))}
        </ul>
      </main>
      <CartSummary
        subtotal={toEthString(subtotalWei)}
        discount="0"
        networkFee={DEMO_NETWORK_FEE}
        total={toEthString(subtotalWei + feeWei)}
        onCheckout={() => navigate({ to: '/checkout' })}
      />
    </>
  )
}

function EmptyCart() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Carrinho de NFTs" />
      <main className="flex flex-1 flex-col">
        <EmptyState
          icon={<ShoppingCart />}
          title="Seu carrinho está vazio"
          description="Explore o catálogo e adicione os NFTs que quiser colecionar."
          action={{ label: 'Explorar NFTs', to: '/' }}
        />
      </main>
    </div>
  )
}
