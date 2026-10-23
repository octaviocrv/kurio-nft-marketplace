import { networkSchema, walletProviderSchema } from '@/api/shared'
import type { Wallet, WalletSlot } from '@/api/wallet'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { networkLabels } from '@/features/catalog/labels'
import { walletProviderLabels } from '@/features/checkout/labels'

interface WalletFormProps {
  slot: WalletSlot
  wallet?: Wallet // ausente = cadastro de carteira nova
  onCancel: () => void
}

// Campos do contrato Wallet (o Figma repete campos do perfil aqui; ver decisoes.md).
// Fase 1: só o formulário. Validação (endereço 0x, ENS) e salvar entram na fase 2.
export function WalletForm({ slot, wallet, onCancel }: WalletFormProps) {
  const id = (field: string) => `${slot}-${field}`

  return (
    <form className="flex flex-col gap-4 rounded-xl bg-card p-4" onSubmit={(event) => event.preventDefault()} noValidate>
      <FormField id={id('nickname')} label="Apelido da carteira" required>
        <Input id={id('nickname')} defaultValue={wallet?.nickname} placeholder="Ex.: Principal" />
      </FormField>
      <FormField id={id('address')} label="Endereço da carteira" required>
        <Input id={id('address')} defaultValue={wallet?.address} placeholder="Endereço 0x da carteira" spellCheck={false} autoComplete="off" />
      </FormField>
      <FormField id={id('ens')} label="Nome ENS (opcional)">
        <Input id={id('ens')} defaultValue={wallet?.ensName ?? ''} placeholder="nome.eth" spellCheck={false} autoComplete="off" />
      </FormField>
      <FormField id={id('network')} label="Rede" required>
        <Select defaultValue={wallet?.network}>
          <SelectTrigger id={id('network')} className="w-full">
            <SelectValue placeholder="Selecione uma rede" />
          </SelectTrigger>
          <SelectContent>
            {networkSchema.options.map((network) => (
              <SelectItem key={network} value={network}>{networkLabels[network]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id={id('provider')} label="Tipo de carteira" required>
        <Select defaultValue={wallet?.provider}>
          <SelectTrigger id={id('provider')} className="w-full">
            <SelectValue placeholder="Selecione uma carteira" />
          </SelectTrigger>
          <SelectContent>
            {walletProviderSchema.options.map((provider) => (
              <SelectItem key={provider} value={provider}>{walletProviderLabels[provider]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Salvar carteira
        </Button>
      </div>
    </form>
  )
}
