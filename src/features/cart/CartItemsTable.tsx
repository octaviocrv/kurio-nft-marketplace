import { Trash2 } from 'lucide-react'
import type { CartItem } from '@/api/cart'
import { EthAmount } from '@/components/EthAmount'
import { QuantityStepper } from '@/components/QuantityStepper'
import { multiplyWei, parseEth, toEthString } from '@/lib/eth'

interface CartItemsTableProps {
  items: CartItem[]
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  disabled?: boolean
}

/** Carrinho em tabela (Figma desktop). Mesmos dados e ações dos cards do mobile. */
export function CartItemsTable({ items, onQuantityChange, onRemove, disabled = false }: CartItemsTableProps) {
  return (
    <table className="w-full border-separate border-spacing-y-3 text-sm">
      <caption className="sr-only">Itens do carrinho</caption>
      <thead>
        <tr className="text-left">
          <th scope="col" className="border-b pb-3 font-bold">NFTs</th>
          <th scope="col" className="border-b pb-3 font-bold">Preço</th>
          <th scope="col" className="border-b pb-3 font-bold">Quantidade</th>
          <th scope="col" className="border-b pb-3 font-bold">Total</th>
          <th scope="col" className="border-b pb-3">
            <span className="sr-only">Remover</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="bg-card">
            <td className="rounded-l-lg">
              <div className="flex items-center gap-4">
                <img src={item.image} alt="" width={72} height={72} loading="lazy" className="size-18 shrink-0 rounded-l-lg object-cover" />
                <div className="min-w-0 py-2">
                  <h2 className="truncate font-bold">{item.name}</h2>
                  <p className="text-xs text-muted-foreground">Edição: {item.editionLabel}</p>
                </div>
              </div>
            </td>
            <td>
              <EthAmount value={item.unitPrice} className="text-muted-foreground" />
            </td>
            <td>
              <QuantityStepper
                value={item.quantity}
                max={item.available}
                onChange={(quantity) => onQuantityChange(item.id, quantity)}
                label={`Quantidade de ${item.name}`}
                disabled={disabled}
              />
            </td>
            <td>
              <EthAmount value={toEthString(multiplyWei(parseEth(item.unitPrice), item.quantity))} className="font-bold text-highlight" />
            </td>
            <td className="rounded-r-lg pr-3 text-right">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={disabled}
                aria-label={`Remover ${item.name} do carrinho`}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-wait"
              >
                <Trash2 className="size-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
