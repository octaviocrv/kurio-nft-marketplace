import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { DesktopPageHeading } from '@/components/layout/DesktopPageHeading'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { CartItemCard } from '@/features/cart/CartItemCard'
import { CartItemsTable } from '@/features/cart/CartItemsTable'
import { CartSummary } from '@/features/cart/CartSummary'
import { useCartOwnerId } from '@/features/cart/useCartOwnerId'
import { useApplyCoupon, useCart, useQuote, useRemoveCartItem, useUpdateCartItem } from '@/features/cart/queries'
import { FavoriteFeedback } from '@/features/favorite/FavoriteFeedback'
import { useFavoriteActions } from '@/features/favorite/useFavoriteActions'
import { useNftList } from '@/features/nft/queries'
import { RelatedNfts } from '@/features/nft/RelatedNfts'
import { TABLET_UP, useMediaQuery } from '@/lib/useMediaQuery'

export const Route = createFileRoute('/carrinho')({ component: CartPage })

function CartPage() {
  const navigate = useNavigate()
  const ownerId = useCartOwnerId()
  const cart = useCart(ownerId)
  const quote = useQuote(ownerId, cart.data)
  const updateItem = useUpdateCartItem(ownerId)
  const removeItem = useRemoveCartItem(ownerId)
  const coupon = useApplyCoupon(ownerId)
  const isWide = useMediaQuery(TABLET_UP)

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
  const handleQuantityChange = (itemId: string, quantity: number) => updateItem.mutate({ itemId, quantity })
  const handleRemove = (itemId: string) => removeItem.mutate(itemId)

  return (
    <>
      <div className="md:hidden">
        <PageHeader title="Carrinho de NFTs" />
      </div>
      {/* Mobile: espaço no fim para o resumo fixo. Tablet/desktop: tabela e resumo lado a lado */}
      <main className="mx-auto max-w-md px-6 pb-[calc(25rem+env(safe-area-inset-bottom))] md:page-container md:flex md:flex-col md:gap-8 md:pt-6 md:pb-0">
        <DesktopPageHeading title="Carrinho de NFTs" crumb="Carrinho" />
        <div className="md:flex md:flex-col md:gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-20">
          <div>
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
            {isWide ? (
              <CartItemsTable items={cart.data.items} disabled={itemsPending} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
            ) : (
              <ul className="flex flex-col gap-4">
                {cart.data.items.map((item) => (
                  <li key={item.id}>
                    <CartItemCard item={item} disabled={itemsPending} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
                  </li>
                ))}
              </ul>
            )}
          </div>
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
        </div>
        {isWide && <AlsoViewed excludeNftIds={cart.data.items.map((item) => item.nftId)} />}
      </main>
    </>
  )
}

/** "Colecionadores também viram" (Figma desktop): mais favoritados que ainda não estão no carrinho. */
function AlsoViewed({ excludeNftIds }: { excludeNftIds: string[] }) {
  const popular = useNftList({ sort: 'populares', page: 1, pageSize: 10 })
  const favorites = useFavoriteActions()
  const nfts = (popular.data?.items ?? []).filter((nft) => !excludeNftIds.includes(nft.id)).slice(0, 5)

  return (
    <div className="mt-12 flex flex-col gap-4">
      <FavoriteFeedback error={favorites.error} />
      <RelatedNfts
        title="Colecionadores também viram"
        nfts={nfts}
        favoriteIds={favorites.favoriteIds}
        favoriteDisabled={favorites.disabled}
        onFavoriteToggle={favorites.toggle}
      />
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="min-h-dvh md:min-h-0">
      <div className="md:hidden">
        <PageHeader title="Carrinho de NFTs" />
      </div>
      <main
        aria-busy="true"
        aria-label="Carregando carrinho"
        className="mx-auto flex max-w-md flex-col gap-4 px-6 pb-[calc(25rem+env(safe-area-inset-bottom))] md:page-container md:gap-8 md:pt-24 md:pb-0 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-20"
      >
        <div className="flex flex-col gap-4 md:gap-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-25 rounded-xl md:h-18 md:rounded-lg" />)}
        </div>
        <div aria-hidden className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:static md:rounded-none md:border-0 md:bg-transparent md:pb-0">
          <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pt-5 pb-5 md:max-w-none md:p-0">
            <Skeleton className="h-12 rounded-full" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((row) => <Skeleton key={row} className="h-5 w-full" />)}
            </div>
            <Skeleton className="h-12 rounded-full" />
          </div>
        </div>
      </main>
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
