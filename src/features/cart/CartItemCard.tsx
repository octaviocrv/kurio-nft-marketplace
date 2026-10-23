import { Trash2 } from 'lucide-react'
import type { CartItem } from '@/api/cart'
import { EthAmount } from '@/components/EthAmount'
import { QuantityStepper } from '@/components/QuantityStepper'
import { multiplyWei, parseEth, toEthString } from '@/lib/eth'

interface CartItemCardProps {
  item: CartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartItemCard({ item, onQuantityChange, onRemove }: CartItemCardProps) {
  const lineTotal = toEthString(multiplyWei(parseEth(item.unitPrice), item.quantity))

  return (
    <article className="flex overflow-hidden rounded-xl bg-card">
      <img src={item.image} alt="" width={100} height={100} loading="lazy" className="aspect-square w-25 shrink-0 object-cover" />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">{item.name}</h2>
            <p className="text-xs text-muted-foreground">Edição: {item.editionLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remover ${item.name} do carrinho`}
            className="-mt-1 -mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-2">
          <EthAmount value={lineTotal} className="font-bold text-highlight" />
          <QuantityStepper
            variant="subtle"
            value={item.quantity}
            max={item.available}
            onChange={(quantity) => onQuantityChange(item.id, quantity)}
            label={`Quantidade de ${item.name}`}
          />
        </div>
      </div>
    </article>
  )
}
