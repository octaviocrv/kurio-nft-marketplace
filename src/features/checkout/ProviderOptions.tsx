import { Wallet as WalletIcon } from 'lucide-react'
import { walletProviderSchema, type WalletProvider } from '@/api/shared'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { walletProviderLabels } from './labels'

interface ProviderOptionsProps {
  selected: WalletProvider
  onSelect: (provider: WalletProvider) => void
}

/** Provedor usado para "conectar" a carteira (simulado; sem extensão real, fora do escopo). */
export function ProviderOptions({ selected, onSelect }: ProviderOptionsProps) {
  return (
    <RadioGroup
      value={selected}
      onValueChange={(value) => onSelect(value as WalletProvider)}
      aria-label="Provedor da carteira"
      className="gap-4"
    >
      {walletProviderSchema.options.map((provider) => (
        <label key={provider} htmlFor={`provider-${provider}`} className="flex cursor-pointer items-center gap-4 rounded-xl bg-card p-3 pr-4">
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-soft bg-secondary text-sm font-bold text-highlight">
            {/* Figma: inicial em círculo; a Coinbase usa ícone de carteira */}
            {provider === 'coinbase' ? <WalletIcon className="size-5" /> : walletProviderLabels[provider][0]}
          </span>
          <span className="flex-1 text-sm">{walletProviderLabels[provider]}</span>
          <RadioGroupItem id={`provider-${provider}`} value={provider} />
        </label>
      ))}
    </RadioGroup>
  )
}
