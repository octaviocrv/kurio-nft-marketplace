import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  max: number // estoque disponível: o "+" trava aqui
  onChange: (value: number) => void
  label: string // ex.: "Quantidade de Emerald Ape #042"
  className?: string
}

const MIN_QUANTITY = 1

export function QuantityStepper({ value, max, onChange, label, className }: QuantityStepperProps) {
  const buttonClass =
    'flex size-6 cursor-pointer items-center justify-center rounded-md bg-primary text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground'

  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-3', className)}>
      <button type="button" className={buttonClass} onClick={() => onChange(value - 1)} disabled={value <= MIN_QUANTITY} aria-label="Diminuir quantidade">
        <Minus className="size-4" />
      </button>
      {/* aria-live: quem usa leitor de tela ouve o novo valor a cada toque */}
      <output aria-live="polite" className="min-w-4 text-center text-lg font-bold">
        {value}
      </output>
      <button type="button" className={buttonClass} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade">
        <Plus className="size-4" />
      </button>
    </div>
  )
}
