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

/** Mobile: barra fixa no rodapé. Tablet/desktop: os mesmos controles em linha, ao lado das informações. */
export function BuyBar({ nftName, total, quantity, maxQuantity, onQuantityChange, onBuy, onAddToCart, soldOut, isPending = false }: BuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:static md:rounded-none md:border-0 md:bg-transparent md:pb-0">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pt-5 pb-5 md:mx-0 md:max-w-none md:p-0 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-muted-foreground">Qtd.</span>
            <QuantityStepper value={quantity} max={maxQuantity} onChange={onQuantityChange} label={`Quantidade de ${nftName}`} disabled={isPending} />
          </div>
          <EthAmount value={total} className="text-xl font-bold text-highlight" />
        </div>

        <div className="flex gap-3">
          <Button size="lg" className="flex-1 rounded-full md:h-11 md:flex-none md:px-8" onClick={onBuy} disabled={soldOut || isPending}>
            {soldOut ? 'Esgotado' : isPending ? 'Adicionando…' : 'Comprar NFT'}
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="size-14 rounded-full md:size-11"
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
