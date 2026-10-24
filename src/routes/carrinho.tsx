import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { CartItemCard } from '@/features/cart/CartItemCard'
import { CartSummary } from '@/features/cart/CartSummary'
import { useCartOwnerId } from '@/features/cart/useCartOwnerId'
import { useApplyCoupon, useCart, useQuote, useRemoveCartItem, useUpdateCartItem } from '@/features/cart/queries'

export const Route = createFileRoute('/carrinho')({ component: CartPage })

function CartPage() {
  const navigate = useNavigate()
  const ownerId = useCartOwnerId()
  const cart = useCart(ownerId)
  const quote = useQuote(ownerId, cart.data)
  const updateItem = useUpdateCartItem(ownerId)
  const removeItem = useRemoveCartItem(ownerId)
  const coupon = useApplyCoupon(ownerId)

  if (cart.isPending) return <CartSkeleton />
  if (cart.isError) {
    return (
      <div className="flex min-h-dvh flex-col">
        <PageHeader title="Carrinho de NFTs" />
        <ErrorState title="Não foi possível carregar o carrinho" description={cart.error.message} onRetry={() => cart.refetch()} isRetrying={cart.isFetching} />
      </div>
    )
  }
  if (cart.data.items.length === 0) return <EmptyCart />

  const mutationError = updateItem.error ?? removeItem.error
  const totals = quote.data ?? { subtotal: '0', discount: '0', networkFee: '0', total: '0', coupon: null }
  const itemsPending = updateItem.isPending || removeItem.isPending

  return (
    <>
      <PageHeader title="Carrinho de NFTs" />
      <main className="mx-auto max-w-md px-6 pb-[calc(25rem+env(safe-area-inset-bottom))]">
        {mutationError && (
          <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {mutationError.message}
          </p>
        )}
        {quote.error && (
          <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>{quote.error.message}</span>
            <Button variant="outline" size="sm" onClick={() => quote.refetch()} disabled={quote.isFetching}>Tentar novamente</Button>
          </div>
        )}
        {quote.data?.issues.length ? (
          <p role="alert" className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            Preço ou estoque mudou. A cotação já mostra os valores atuais; confirme-os antes de finalizar.
          </p>
        ) : null}
        <ul className="flex flex-col gap-4">
          {cart.data.items.map((item) => (
            <li key={item.id}>
              <CartItemCard
                item={item}
                disabled={itemsPending}
                onQuantityChange={(itemId, quantity) => updateItem.mutate({ itemId, quantity })}
                onRemove={(itemId) => removeItem.mutate(itemId)}
              />
            </li>
          ))}
        </ul>
      </main>
      <CartSummary
        key={cart.data.couponCode ?? 'no-coupon'}
        subtotal={totals.subtotal}
        discount={totals.discount}
        networkFee={totals.networkFee}
        total={totals.total}
        couponCode={cart.data.couponCode}
        couponDescription={totals.coupon?.description}
        couponError={coupon.error}
        isCouponPending={coupon.isPending}
        isQuotePending={quote.isPending || quote.isFetching}
        showQuoteSkeleton={quote.isPending && !quote.data}
        checkoutDisabled={!quote.data || quote.isFetching || quote.isError || quote.data.issues.length > 0}
        onApplyCoupon={(code) => coupon.mutate(code)}
        onRemoveCoupon={() => coupon.mutate(null)}
        onCheckout={() => navigate({ to: '/checkout' })}
      />
    </>
  )
}

function CartSkeleton() {
  return (
    <div className="min-h-dvh">
      <PageHeader title="Carrinho de NFTs" />
      <main aria-busy="true" aria-label="Carregando carrinho" className="mx-auto flex max-w-md flex-col gap-4 px-6 pb-[calc(25rem+env(safe-area-inset-bottom))]">
        {[1, 2, 3].map((item) => <Skeleton key={item} className="h-25 rounded-xl" />)}
      </main>
      <div aria-hidden className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pt-5 pb-5">
          <Skeleton className="h-12 rounded-full" />
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((row) => <Skeleton key={row} className="h-5 w-full" />)}
          </div>
          <Skeleton className="h-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Carrinho de NFTs" />
      <main className="flex flex-1 flex-col">
        <EmptyState
          icon={<ShoppingCart />}
          title="Seu carrinho está vazio"
          description="Explore o catálogo e adicione os NFTs que quiser colecionar."
          action={{ label: 'Explorar NFTs', to: '/' }}
        />
      </main>
    </div>
  )
}
