import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { networkSchema, walletProviderSchema } from '@/api/shared'
import { walletInputSchema, type Wallet, type WalletInput, type WalletSlot } from '@/api/wallet'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { networkLabels } from '@/features/catalog/labels'
import { walletProviderLabels } from '@/features/checkout/labels'
import { fieldA11y } from '@/lib/fieldA11y'
import { showApiError } from './formErrors'

interface WalletFormProps {
  slot: WalletSlot
  wallet?: Wallet // ausente = cadastro de carteira nova
  onSave: (input: WalletInput) => Promise<unknown>
  onCancel: () => void
}

const walletFields = ['nickname', 'address', 'ensName', 'network', 'provider'] as const

// Campos do contrato Wallet (o Figma repete campos do perfil aqui; ver decisoes.md).
export function WalletForm({ slot, wallet, onSave, onCancel }: WalletFormProps) {
  const id = (field: string) => `${slot}-${field}`
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WalletInput>({
    resolver: zodResolver(walletInputSchema),
    defaultValues: {
      nickname: wallet?.nickname ?? '',
      address: wallet?.address ?? '',
      ensName: wallet?.ensName ?? null,
      network: wallet?.network,
      provider: wallet?.provider,
    },
  })

  async function submit(input: WalletInput) {
    try {
      await onSave(input)
    } catch (error) {
      showApiError(error, setError, walletFields)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)} noValidate>
      <FormField id={id('nickname')} label="Apelido da carteira" required error={errors.nickname?.message}>
        <Input id={id('nickname')} placeholder="Ex.: Principal" {...fieldA11y(id('nickname'), errors.nickname?.message)} {...register('nickname')} />
      </FormField>
      <FormField id={id('address')} label="Endereço da carteira" required error={errors.address?.message}>
        <Input
          id={id('address')}
          placeholder="Endereço 0x da carteira"
          spellCheck={false}
          autoComplete="off"
          {...fieldA11y(id('address'), errors.address?.message)}
          {...register('address')}
        />
      </FormField>
      <FormField id={id('ens')} label="Nome ENS (opcional)" error={errors.ensName?.message}>
        <Input
          id={id('ens')}
          placeholder="nome.eth"
          spellCheck={false}
          autoComplete="off"
          {...fieldA11y(id('ens'), errors.ensName?.message)}
          // Campo vazio vira null (sem ENS), que é o que o contrato espera; o valor inicial também passa por aqui, por isso aceita null
          {...register('ensName', { setValueAs: (value: string | null) => value?.trim().toLowerCase() || null })}
        />
      </FormField>
      <FormField id={id('network')} label="Rede" required error={errors.network?.message}>
        <Controller
          control={control}
          name="network"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger id={id('network')} ref={field.ref} onBlur={field.onBlur} className="w-full" {...fieldA11y(id('network'), errors.network?.message)}>
                <SelectValue placeholder="Selecione uma rede" />
              </SelectTrigger>
              <SelectContent>
                {networkSchema.options.map((network) => (
                  <SelectItem key={network} value={network}>{networkLabels[network]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <FormField id={id('provider')} label="Tipo de carteira" required error={errors.provider?.message}>
        <Controller
          control={control}
          name="provider"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger id={id('provider')} ref={field.ref} onBlur={field.onBlur} className="w-full" {...fieldA11y(id('provider'), errors.provider?.message)}>
                <SelectValue placeholder="Selecione uma carteira" />
              </SelectTrigger>
              <SelectContent>
                {walletProviderSchema.options.map((provider) => (
                  <SelectItem key={provider} value={provider}>{walletProviderLabels[provider]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {errors.root?.message && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.root.message}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar carteira'}
        </Button>
      </div>
    </form>
  )
}
