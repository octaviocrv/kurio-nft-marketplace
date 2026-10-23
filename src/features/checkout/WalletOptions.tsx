import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { Wallet } from '@/api/wallet'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { networkLabels } from '@/features/catalog/labels'
import { shortenAddress } from '@/lib/wallet'

interface WalletOptionsProps {
  wallets: Wallet[]
  selectedId: string
  onSelect: (walletId: string) => void
}

/** Carteiras cadastradas como cards selecionáveis (radio). O card inteiro é clicável via <label>. */
export function WalletOptions({ wallets, selectedId, onSelect }: WalletOptionsProps) {
  return (
    <RadioGroup value={selectedId} onValueChange={onSelect} aria-label="Carteira para pagamento" className="gap-4">
      {wallets.map((wallet) => (
        <div key={wallet.id} className="flex items-start rounded-xl bg-card has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-border-soft">
          <label htmlFor={wallet.id} className="flex flex-1 cursor-pointer items-start gap-4 p-4">
            <RadioGroupItem id={wallet.id} value={wallet.id} className="mt-1" />
            <span className="flex flex-col gap-1 text-sm">
              <span className="font-bold">{wallet.nickname}</span>
              {/* ENS é mais legível que o endereço: quando existe, aparece no lugar dele */}
              <span className="text-muted-foreground">{wallet.ensName ?? shortenAddress(wallet.address)}</span>
              <span className="text-muted-foreground">Rede {networkLabels[wallet.network]}</span>
            </span>
          </label>
          {/* Fora do <label>: link dentro de label dispararia a seleção junto */}
          <Link
            to="/conta/carteiras"
            aria-label={`Gerenciar carteira ${wallet.nickname}`}
            className="m-2 flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <MoreVertical className="size-5" />
          </Link>
        </div>
      ))}
    </RadioGroup>
  )
}
