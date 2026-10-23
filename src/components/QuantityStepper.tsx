import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  max: number // estoque disponível: o "+" trava aqui
  onChange: (value: number) => void
  label: string // ex.: "Quantidade de Emerald Ape #042"
  variant?: 'solid' | 'subtle' // solid: quadrado laranja (detalhe); subtle: redondo escuro (carrinho)
  className?: string
}

const MIN_QUANTITY = 1

const variantClasses = {
  solid: 'size-6 rounded-md bg-primary text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground',
  subtle: 'size-7 rounded-full border border-border-soft bg-secondary text-foreground disabled:opacity-40',
}

export function QuantityStepper({ value, max, onChange, label, variant = 'solid', className }: QuantityStepperProps) {
  const buttonClass = cn(
    'flex cursor-pointer items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed',
    variantClasses[variant],
  )

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
