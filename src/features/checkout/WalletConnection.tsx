import type { RefObject } from 'react'
import type { Wallet } from '@/api/wallet'
import { Button } from '@/components/ui/button'

interface WalletConnectionProps {
  wallet: Wallet
  isConnecting: boolean
  isDisconnecting: boolean
  error?: string
  connectButtonRef: RefObject<HTMLButtonElement | null>
  onConnect: () => void
  onDisconnect: () => void
}

/** Estado da conexão da carteira escolhida (simulada) com as ações de conectar e desconectar. */
export function WalletConnection({ wallet, isConnecting, isDisconnecting, error, connectButtonRef, onConnect, onDisconnect }: WalletConnectionProps) {
  const busy = isConnecting || isDisconnecting
  const status = isConnecting ? 'Conectando…' : isDisconnecting ? 'Desconectando…' : wallet.connected ? `${wallet.nickname} conectada` : `${wallet.nickname} desconectada`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-soft p-4 text-sm">
        {/* role="status": o resultado da conexão é anunciado sem tirar o foco do botão */}
        <p role="status" className={wallet.connected && !busy ? 'font-bold text-highlight' : 'text-muted-foreground'}>{status}</p>
        {wallet.connected ? (
          <Button type="button" variant="outline" size="sm" onClick={onDisconnect} disabled={busy}>Desconectar</Button>
        ) : (
          <Button type="button" size="sm" ref={connectButtonRef} onClick={onConnect} disabled={busy}>
            {isConnecting ? 'Conectando…' : 'Conectar carteira'}
          </Button>
        )}
      </div>
      {error && <p role="alert" className="px-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
