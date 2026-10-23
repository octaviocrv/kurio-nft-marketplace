import type { Order } from '@/api/order'
import { EthAmount } from '@/components/EthAmount'
import { SummaryRow } from '@/components/SummaryRow'
import { parseEth } from '@/lib/eth'

/** Itens e valores do pedido, sempre a partir do snapshot salvo nele (nunca do catálogo atual). */
export function OrderReceipt({ order }: { order: Order }) {
  const hasDiscount = parseEth(order.discount) > 0n

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-bold">Detalhes da transação</h2>

      <ul className="flex flex-col gap-3 border-t border-border pt-3">
        {order.items.map((item) => (
          <li key={item.editionId} className="flex items-center gap-3 text-sm">
            <img src={item.image} alt="" width={56} height={56} loading="lazy" className="size-14 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{item.name}</p>
              <p className="text-xs text-muted-foreground">ID do token: #{item.tokenId}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">(x {item.quantity})</span>
            <EthAmount value={item.subtotal} className="w-24 shrink-0 text-right font-bold text-highlight" />
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2 border-t border-border pt-3">
        {hasDiscount && <SummaryRow label="Desconto do cupom" value={order.discount} variant="discount" />}
        <SummaryRow label="Taxa de rede" value={order.networkFee} />
        <SummaryRow label="Total" value={order.total} variant="total" />
      </dl>
    </section>
  )
}
