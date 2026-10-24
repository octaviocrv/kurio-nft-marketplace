import { BellRing, X } from 'lucide-react'
import type { RealtimeNotice as Notice } from './useRealtimeSync'

/**
 * Aviso de mudança em tempo real (preço/estoque de item do carrinho). A região aria-live fica sempre
 * no DOM, vazia: leitor de tela só anuncia texto que entra numa região já existente. Sem role="status"
 * de propósito: o aviso é global e não deve se misturar com os status de cada tela.
 */
export function RealtimeNotice({ notice, onDismiss }: { notice: Notice | null; onDismiss: () => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-md justify-center px-4">
      {notice && (
        <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border-soft bg-card p-4 text-sm shadow-lg">
          <BellRing aria-hidden className="mt-0.5 size-4 shrink-0 text-highlight" />
          <p>{notice.message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dispensar aviso"
            className="-m-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
