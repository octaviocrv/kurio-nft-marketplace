import { Check, Copy, Plus, Wallet as WalletIcon } from 'lucide-react'
import { useState } from 'react'
import type { Wallet, WalletInput, WalletSlot } from '@/api/wallet'
import { Button } from '@/components/ui/button'
import { networkLabels } from '@/features/catalog/labels'
import { walletProviderLabels } from '@/features/checkout/labels'
import { shortenAddress } from '@/lib/wallet'
import { AccountCard } from './AccountCard'
import { WalletForm } from './WalletForm'

const slotNames: Record<WalletSlot, string> = {
  primary: 'principal',
  secondary: 'secundária',
}

/** Uma carteira (principal ou secundária): card com os dados, ou vazio com "Adicionar". O formulário abre no lugar. */
export function WalletSection({ slot, wallet, onSave }: { slot: WalletSlot; wallet?: Wallet; onSave: (input: WalletInput) => Promise<unknown> }) {
  const [editing, setEditing] = useState(false)
  const title = `Carteira ${slotNames[slot]}`

  if (editing) {
    return (
      <AccountCard title={wallet ? `Editar ${title.toLowerCase()}` : `Nova ${title.toLowerCase()}`}>
        <WalletForm
          slot={slot}
          wallet={wallet}
          // Só fecha o formulário depois que a API aceitou; com erro ele continua aberto para corrigir
          onSave={async (input) => {
            await onSave(input)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </AccountCard>
    )
  }

  if (!wallet) {
    return (
      // O card vazio inteiro é o botão: alvo de toque grande e sem ação escondida
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border-soft p-6 text-sm text-muted-foreground transition-colors outline-none hover:border-primary hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Plus className="size-6" />
        <span className="font-bold">Adicionar {title.toLowerCase()}</span>
        <span className="text-xs">Você ainda não adicionou uma carteira {slotNames[slot]}.</span>
      </button>
    )
  }

  return (
    <AccountCard
      title={title}
      action={
        <Button variant="outline" size="sm" className="h-8" onClick={() => setEditing(true)}>
          Editar
        </Button>
      }
    >
      <div className="flex items-center gap-4">
        <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border-soft bg-secondary text-highlight">
          <WalletIcon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-bold">{wallet.nickname}</p>
          {wallet.ensName && <p className="truncate text-sm text-highlight">{wallet.ensName}</p>}
        </div>
      </div>

      <CopyableAddress address={wallet.address} />

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-border-soft px-3 py-1 text-xs text-muted-foreground">Rede {networkLabels[wallet.network]}</span>
        <span className="rounded-full border border-border-soft px-3 py-1 text-xs text-muted-foreground">{walletProviderLabels[wallet.provider]}</span>
      </div>
    </AccountCard>
  )
}

/** Endereço abreviado com botão de copiar o endereço completo (o que o usuário cola em outro lugar). */
function CopyableAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Sem permissão de área de transferência (ex.: http): o endereço continua visível para copiar à mão
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-background px-4 py-3">
      <code className="truncate text-sm">{shortenAddress(address)}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Endereço copiado' : 'Copiar endereço completo'}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {copied ? <Check className="size-4 text-highlight" /> : <Copy className="size-4" />}
      </button>
      {/* Anuncia "copiado" para leitor de tela sem depender do ícone */}
      <span role="status" className="sr-only">{copied ? 'Endereço copiado' : ''}</span>
    </div>
  )
}
