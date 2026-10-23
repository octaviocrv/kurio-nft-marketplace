import type { CartItem } from '@/api/cart'
import type { Network, WalletProvider } from '@/api/shared'
import type { Wallet } from '@/api/wallet'
import { EthAmount } from '@/components/EthAmount'
import { SummaryRow } from '@/components/SummaryRow'
import { networkLabels } from '@/features/catalog/labels'
import { multiplyWei, parseEth, toEthString } from '@/lib/eth'
import { shortenAddress } from '@/lib/wallet'
import { walletProviderLabels } from './labels'

interface CheckoutReviewProps {
  items: CartItem[]
  buyer: { name: string; email: string }
  wallet: Wallet
  provider: WalletProvider
  network: Network
  totals: { subtotal: string; discount: string; networkFee: string; total: string }
}

/** Etapa de revisão (não existe no Figma): tudo o que vai ser enviado, antes do clique final. */
export function CheckoutReview({ items, buyer, wallet, provider, network, totals }: CheckoutReviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-bold">Itens</h2>
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <img src={item.image} alt="" width={48} height={48} loading="lazy" className="size-12 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Edição {item.editionLabel} · {item.quantity}×
                </p>
              </div>
              <EthAmount value={toEthString(multiplyWei(parseEth(item.unitPrice), item.quantity))} className="font-bold text-highlight" />
            </li>
          ))}
        </ul>
      </section>

      <ReviewBlock
        title="Dados do colecionador"
        rows={[
          ['Nome', buyer.name],
          ['E-mail', buyer.email],
        ]}
      />
      <ReviewBlock
        title="Pagamento"
        rows={[
          ['Carteira', `${wallet.nickname} · ${wallet.ensName ?? shortenAddress(wallet.address)}`],
          ['Provedor', walletProviderLabels[provider]],
          ['Rede', networkLabels[network]],
        ]}
      />

      <dl className="flex flex-col gap-2 border-t border-border pt-4">
        <SummaryRow label="Subtotal" value={totals.subtotal} />
        <SummaryRow label="Desconto do cupom" value={totals.discount} variant="discount" />
        <SummaryRow label="Taxa de rede" value={totals.networkFee} />
        <SummaryRow label="Total" value={totals.total} variant="total" />
      </dl>
      {/* Enunciado: preço, estoque, cupom e taxa são revalidados antes de confirmar (fase 2) */}
      <p className="text-center text-xs text-muted-foreground">Preços e disponibilidade são conferidos novamente ao confirmar.</p>
    </div>
  )
}

function ReviewBlock({ title, rows }: { title: string; rows: [label: string, value: string][] }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl bg-card p-4">
      <h2 className="font-bold">{title}</h2>
      <dl className="flex flex-col gap-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="truncate text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
