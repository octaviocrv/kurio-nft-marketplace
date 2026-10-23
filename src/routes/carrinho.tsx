import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import type { CartItem } from '@/api/cart'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { CartItemCard } from '@/features/cart/CartItemCard'
import { CartSummary } from '@/features/cart/CartSummary'
import { multiplyWei, parseEth, sumWei, toEthString } from '@/lib/eth'
import { nfts } from '@/mocks/fixtures/nfts' // fase 1: vira hook de Query na fase 2

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

// TEMPORÁRIO (fase 1): carrinho de exemplo montado com 4 NFTs das fixtures. Na fase 2 vem da API.
const demoCartItems: CartItem[] = nfts.slice(0, 4).map((nft, index) => {
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

// Fase 1: totais calculados aqui só para a tela reagir. Na fase 2 quem calcula é a cotação da API.
const DEMO_NETWORK_FEE = '0.016'

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

// Estado vazio não desenhado no Figma: segue o padrão visual das outras telas
function EmptyCart() {
  return (
    <>
      <PageHeader title="Carrinho de NFTs" />
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 pt-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-card text-muted-foreground">
          <ShoppingCart className="size-7" />
        </div>
        <h2 className="text-lg font-bold">Seu carrinho está vazio</h2>
        <p className="text-sm text-muted-foreground">Explore o catálogo e adicione os NFTs que quiser colecionar.</p>
        <Button asChild>
          <Link to="/">Explorar NFTs</Link>
        </Button>
      </main>
    </>
  )
}
