import { formatEth, parseEth } from '@/lib/eth'
import { cn } from '@/lib/utils'

/** Valor em ETH vindo da API (string decimal), exibido com a regra de formatação de src/lib/eth.ts. */
export function EthAmount({ value, className }: { value: string; className?: string }) {
  return <span className={cn('whitespace-nowrap', className)}>{formatEth(parseEth(value))} ETH</span>
}
