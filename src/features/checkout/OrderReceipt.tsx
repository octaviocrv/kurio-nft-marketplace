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

      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {order.items.map((item) => (
          <li key={item.editionId} className="flex items-center gap-3 py-3">
            <img src={item.image} alt="" width={56} height={56} loading="lazy" className="size-14 shrink-0 rounded-lg object-cover" />
            {/* Nome, o que foi comprado (edição e token) e a conta que leva ao subtotal */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{item.name}</p>
              {/* Sem truncate: no celular a linha quebra em duas em vez de esconder o ID do token */}
              <p className="text-xs text-muted-foreground">
                Edição {item.editionLabel} · ID do token: #{item.tokenId}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} × <EthAmount value={item.unitPrice} />
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <EthAmount value={item.subtotal} className="font-bold text-highlight" />
            </div>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2">
        <SummaryRow label="Subtotal dos itens" value={order.subtotal} />
        {hasDiscount && <SummaryRow label="Desconto do cupom" value={order.discount} variant="discount" />}
        <SummaryRow label="Taxa de rede" value={order.networkFee} />
        <SummaryRow label="Total" value={order.total} variant="total" />
      </dl>
    </section>
  )
}
