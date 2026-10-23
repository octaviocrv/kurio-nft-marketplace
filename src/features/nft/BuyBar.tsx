import { ShoppingCart } from 'lucide-react'
import { EthAmount } from '@/components/EthAmount'
import { QuantityStepper } from '@/components/QuantityStepper'
import { Button } from '@/components/ui/button'

interface BuyBarProps {
  nftName: string
  total: string // preço × quantidade, já calculado em bigint pela rota
  quantity: number
  maxQuantity: number
  onQuantityChange: (quantity: number) => void
  onBuy: () => void
  onAddToCart: () => void
  soldOut: boolean
  isPending?: boolean
}

export function BuyBar({ nftName, total, quantity, maxQuantity, onQuantityChange, onBuy, onAddToCart, soldOut, isPending = false }: BuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pt-5 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-muted-foreground">Qtd.</span>
            <QuantityStepper value={quantity} max={maxQuantity} onChange={onQuantityChange} label={`Quantidade de ${nftName}`} disabled={isPending} />
          </div>
          <EthAmount value={total} className="text-xl font-bold text-highlight" />
        </div>

        <div className="flex gap-3">
          <Button size="lg" className="flex-1 rounded-full" onClick={onBuy} disabled={soldOut || isPending}>
            {soldOut ? 'Esgotado' : isPending ? 'Adicionando…' : 'Comprar NFT'}
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="size-14 rounded-full"
            onClick={onAddToCart}
            disabled={soldOut || isPending}
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
