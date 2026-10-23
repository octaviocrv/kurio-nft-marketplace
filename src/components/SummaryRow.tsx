import { EthAmount } from '@/components/EthAmount'
import { cn } from '@/lib/utils'

interface SummaryRowProps {
  label: string
  value: string // ETH em string decimal
  variant?: 'default' | 'discount' | 'total'
  hint?: string // texto pequeno abaixo do valor (ex.: "Taxa estimada")
}

/** Linha de resumo de valores: carrinho, revisão do pedido e recibo. */
export function SummaryRow({ label, value, variant = 'default', hint }: SummaryRowProps) {
  const isTotal = variant === 'total'
  return (
    <div className={cn('flex items-start justify-between gap-4 text-sm', isTotal && 'text-base font-bold')}>
      <dt>{label}</dt>
      <dd className="flex flex-col items-end">
        <span>
          {variant === 'discount' && <span aria-label="menos">(-) </span>}
          <EthAmount value={value} className={cn(isTotal && 'text-lg text-highlight')} />
        </span>
        {hint && <span className="text-xs text-highlight">{hint}</span>}
      </dd>
    </div>
  )
}
