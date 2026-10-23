import { Wallet as WalletIcon } from 'lucide-react'
import { useState } from 'react'
import type { Wallet, WalletSlot } from '@/api/wallet'
import { Button } from '@/components/ui/button'
import { networkLabels } from '@/features/catalog/labels'
import { walletProviderLabels } from '@/features/checkout/labels'
import { shortenAddress } from '@/lib/wallet'
import { WalletForm } from './WalletForm'

const slotTitles: Record<WalletSlot, string> = {
  primary: 'Carteira principal',
  secondary: 'Carteira secundária',
}

/** Uma seção por carteira: resumo com "Editar" (ou vazio com "Adicionar"); o formulário abre no lugar. */
export function WalletSection({ slot, wallet }: { slot: WalletSlot; wallet?: Wallet }) {
  const [editing, setEditing] = useState(false)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold">{slotTitles[slot]}</h2>
        {!editing && (
          <Button variant="link" className="h-auto p-0" onClick={() => setEditing(true)}>
            {wallet ? 'Editar' : 'Adicionar'}
          </Button>
        )}
      </div>

      {editing ? (
        <WalletForm slot={slot} wallet={wallet} onCancel={() => setEditing(false)} />
      ) : wallet ? (
        <div className="flex items-center gap-4 rounded-xl bg-card p-4">
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-soft bg-secondary text-highlight">
            <WalletIcon className="size-5" />
          </span>
          <dl className="flex min-w-0 flex-col gap-0.5 text-sm">
            <dt className="sr-only">Apelido</dt>
            <dd className="font-bold">{wallet.nickname}</dd>
            <dt className="sr-only">Endereço</dt>
            <dd className="truncate text-muted-foreground">{wallet.ensName ?? shortenAddress(wallet.address)}</dd>
            <dt className="sr-only">Rede e tipo</dt>
            <dd className="text-muted-foreground">
              {networkLabels[wallet.network]} · {walletProviderLabels[wallet.provider]}
            </dd>
          </dl>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border-soft p-4 text-sm text-muted-foreground">
          Você ainda não adicionou uma carteira {slot === 'primary' ? 'principal' : 'secundária'}.
        </p>
      )}
    </section>
  )
}
