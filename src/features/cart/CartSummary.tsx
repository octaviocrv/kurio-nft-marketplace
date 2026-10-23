import { useState } from 'react'
import type { ApiError } from '@/api/error'
import { SummaryRow } from '@/components/SummaryRow'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface CartSummaryProps {
  subtotal: string
  discount: string
  networkFee: string
  total: string
  couponCode: string | null
  couponDescription?: string
  couponError: ApiError | null
  isCouponPending: boolean
  isQuotePending: boolean
  showQuoteSkeleton: boolean
  checkoutDisabled: boolean
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: () => void
  onCheckout: () => void
}

export function CartSummary({
  subtotal,
  discount,
  networkFee,
  total,
  couponCode,
  couponDescription,
  couponError,
  isCouponPending,
  isQuotePending,
  showQuoteSkeleton,
  checkoutDisabled,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
}: CartSummaryProps) {
  const [code, setCode] = useState(couponCode ?? '')

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pt-5 pb-5">
        <form
          className="flex h-12 items-center gap-2 rounded-full border border-border bg-background py-1.5 pr-1.5 pl-5 focus-within:border-ring"
          onSubmit={(event) => {
            event.preventDefault()
            if (couponCode) {
              onRemoveCoupon()
            }
            else if (code.trim()) onApplyCoupon(code.trim().toUpperCase())
          }}
        >
          <label htmlFor="coupon" className="sr-only">Código promocional</label>
          <input
            id="coupon"
            placeholder="Código promocional"
            autoComplete="off"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            disabled={couponCode !== null || isCouponPending}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-ellipsis uppercase outline-none placeholder:normal-case placeholder:text-muted-foreground/70 disabled:opacity-70"
          />
          <Button type="submit" size="sm" disabled={isCouponPending || (!couponCode && !code.trim())} className="h-full shrink-0 rounded-full bg-linear-to-r from-primary to-highlight px-5">
            {isCouponPending ? 'Aguarde…' : couponCode ? 'Remover' : 'Aplicar'}
          </Button>
        </form>

        {couponDescription && <p role="status" className="-mt-2 text-xs text-highlight">{couponDescription}</p>}
        {couponError && <p role="alert" className="-mt-2 text-xs text-destructive">{couponError.fieldErrors?.couponCode ?? couponError.message}</p>}

        {showQuoteSkeleton ? (
          <div aria-busy="true" aria-label="Calculando cotação" className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((row) => <Skeleton key={row} className="h-5 w-full" />)}
          </div>
        ) : (
          <dl className="flex flex-col gap-2">
            <SummaryRow label="Subtotal" value={subtotal} />
            <SummaryRow label="Desconto do cupom" value={discount} variant="discount" />
            <SummaryRow label="Taxa de rede" value={networkFee} hint="Taxa estimada" />
            <SummaryRow label="Total" value={total} variant="total" />
          </dl>
        )}

        <Button size="lg" className="rounded-full" onClick={onCheckout} disabled={checkoutDisabled}>
          {isQuotePending ? 'Atualizando cotação…' : 'Conectar e finalizar'}
        </Button>
      </div>
    </div>
  )
}
