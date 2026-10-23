import { RadioGroup } from 'radix-ui'
import type { Edition } from '@/api/nft'
import { cn } from '@/lib/utils'

interface EditionPickerProps {
  editions: Edition[]
  selectedId: string | undefined
  onSelect: (editionId: string) => void
}

/**
 * Escolha de edição como radiogroup (só uma por vez): as setas do teclado trocam a opção,
 * de graça pelo Radix. Edição esgotada fica visível, mas desabilitada e anunciada.
 */
export function EditionPicker({ editions, selectedId, onSelect }: EditionPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <p id="edition-label" className="font-bold">
        Edição:
      </p>
      <RadioGroup.Root aria-labelledby="edition-label" value={selectedId} onValueChange={onSelect} className="flex flex-wrap gap-2">
        {editions.map((edition) => {
          const soldOut = edition.available === 0
          return (
            <RadioGroup.Item
              key={edition.id}
              value={edition.id}
              disabled={soldOut}
              className={cn(
                'cursor-pointer rounded-full border border-border-soft px-3 py-1 text-sm text-muted-foreground uppercase transition-colors outline-none',
                'hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'data-[state=checked]:border-highlight data-[state=checked]:text-highlight',
                'disabled:cursor-not-allowed disabled:line-through disabled:opacity-50',
              )}
            >
              {edition.label}
              {soldOut && <span className="sr-only"> (esgotada)</span>}
            </RadioGroup.Item>
          )
        })}
      </RadioGroup.Root>
    </div>
  )
}
