import { Button } from '@/components/ui/button'
import { SummaryRow } from '@/components/SummaryRow'

interface CartSummaryProps {
  subtotal: string
  discount: string
  networkFee: string
  total: string
  onCheckout: () => void
}

export function CartSummary({ subtotal, discount, networkFee, total, onCheckout }: CartSummaryProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pt-5 pb-5">
        {/* Fase 1: só visual. Aplicar/remover cupom com erro de inválido/expirado entra na fase 2. */}
        <form
          className="flex h-12 items-center gap-2 rounded-full border border-border bg-background py-1.5 pr-1.5 pl-5 focus-within:border-ring"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="coupon" className="sr-only">Código promocional</label>
          <input
            id="coupon"
            placeholder="Código promocional"
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-ellipsis uppercase outline-none placeholder:normal-case placeholder:text-muted-foreground/70"
          />
          <Button type="submit" size="sm" className="h-full shrink-0 rounded-full bg-linear-to-r from-primary to-highlight px-5">
            Aplicar
          </Button>
        </form>

        <dl className="flex flex-col gap-2">
          <SummaryRow label="Subtotal" value={subtotal} />
          <SummaryRow label="Desconto do cupom" value={discount} variant="discount" />
          <SummaryRow label="Taxa de rede" value={networkFee} hint="Taxa estimada" />
          <SummaryRow label="Total" value={total} variant="total" />
        </dl>

        <Button size="lg" className="rounded-full" onClick={onCheckout}>
          Conectar e finalizar
        </Button>
      </div>
    </div>
  )
}
