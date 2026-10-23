import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ShoppingCart, WalletCards } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { checkoutInputSchema, type CheckoutInput } from '@/api/order'
import { networkSchema, type Network, type WalletProvider } from '@/api/shared'
import type { Session } from '@/api/user'
import type { Wallet } from '@/api/wallet'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { EthAmount } from '@/components/EthAmount'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { requireSession, useSession } from '@/features/auth/queries'
import { cartOwnerId } from '@/features/cart/guestIdentity'
import { useCart, useQuote } from '@/features/cart/queries'
import { networkLabels } from '@/features/catalog/labels'
import { CheckoutReview } from '@/features/checkout/CheckoutReview'
import { ProviderOptions } from '@/features/checkout/ProviderOptions'
import { useWallets } from '@/features/checkout/queries'
import { WalletOptions } from '@/features/checkout/WalletOptions'
import { getOrderAttempt } from '@/features/order/attemptStorage'
import { useCreateOrder } from '@/features/order/queries'

const checkoutSearchSchema = z.object({
  etapa: z.enum(['pagamento', 'revisao']).optional().catch(undefined),
})

export const Route = createFileRoute('/checkout')({
  validateSearch: checkoutSearchSchema,
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location.href),
  component: CheckoutPage,
})

function CheckoutPage() {
  const session = useSession()
  const userId = session.data?.user.id
  const wallets = useWallets(userId)
  const ownerId = userId ? cartOwnerId(userId) : undefined
  const cart = useCart(ownerId)
  const quote = useQuote(ownerId, cart.data)

  if (session.isPending || wallets.isPending || cart.isPending) return <CheckoutSkeleton />
  const failed = session.error ?? wallets.error ?? cart.error
  if (failed) {
    return (
      <div className="flex min-h-dvh flex-col">
        <PageHeader title="Pagamento com carteira" fallbackTo="/carrinho" />
        <ErrorState title="Não foi possível preparar o checkout" description={failed.message} onRetry={() => void Promise.all([session.refetch(), wallets.refetch(), cart.refetch()])} />
      </div>
    )
  }
  if (!session.data || !cart.data) return null
  // Compra enviada sem resposta (timeout): o servidor pode ter confirmado e esvaziado o carrinho.
  // Sem este caminho, um refresh cairia em "carrinho vazio" e o usuário perderia o pedido.
  if (cart.data.items.length === 0 && getOrderAttempt(session.data.user.id)) {
    return <PendingOrderRecovery userId={session.data.user.id} />
  }
  if (cart.data.items.length === 0) {
    return <EmptyState icon={<ShoppingCart />} title="Seu carrinho está vazio" description="Adicione ao menos um NFT antes de finalizar." action={{ label: 'Explorar NFTs', to: '/' }} />
  }
  if (!wallets.data?.items.length) {
    return <EmptyState icon={<WalletCards />} title="Cadastre uma carteira" description="Você precisa de uma carteira para pagar e receber seus NFTs." action={{ label: 'Gerenciar carteiras', to: '/conta/carteiras' }} />
  }

  return (
    <CheckoutContent
      key={`${session.data.user.id}:${wallets.data.items[0]!.id}`}
      session={session.data}
      wallets={wallets.data.items}
      cartQuery={cart}
      quote={quote}
    />
  )
}

function PendingOrderRecovery({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const createOrder = useCreateOrder(userId)

  async function recoverOrder() {
    const attempt = getOrderAttempt(userId)
    if (!attempt) return
    try {
      const order = await createOrder.mutateAsync(attempt.input)
      await navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
    } catch {
      // O motivo já aparece na tela (createOrder.error)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="Pagamento com carteira" fallbackTo="/carrinho" />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <h1 className="text-lg font-bold">Sua compra ainda não foi confirmada</h1>
        <p className="text-sm text-muted-foreground">Não recebemos a resposta do servidor. Recupere o pedido para ver se ele foi concluído.</p>
        {createOrder.error && <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{createOrder.error.message}</p>}
        <Button onClick={recoverOrder} disabled={createOrder.isPending}>
          {createOrder.isPending ? 'Recuperando…' : 'Recuperar pedido'}
        </Button>
        <Button variant="link" asChild>
          <Link to="/carrinho">Voltar ao carrinho</Link>
        </Button>
      </div>
    </div>
  )
}

function CheckoutContent({
  session,
  wallets,
  cartQuery,
  quote,
}: {
  session: Session
  wallets: Wallet[]
  cartQuery: ReturnType<typeof useCart> & { data: NonNullable<ReturnType<typeof useCart>['data']> }
  quote: ReturnType<typeof useQuote>
}) {
  const cart = cartQuery.data
  const { etapa } = Route.useSearch()
  const navigate = useNavigate()
  const createOrder = useCreateOrder(session.user.id)
  const [revalidationMessage, setRevalidationMessage] = useState<string | null>(null)
  // Vale também depois de refresh: a tentativa fica salva até o pedido chegar a um estado final
  const hasOpenAttempt = getOrderAttempt(session.user.id) !== null
  const firstWallet = wallets[0]!
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutInputSchema),
    defaultValues: {
      buyerName: session.user.displayName,
      buyerEmail: session.user.email,
      walletId: firstWallet.id,
      walletProvider: firstWallet.provider,
      network: firstWallet.network,
    },
  })
  const watchedValues = useWatch({ control: form.control })
  const values: CheckoutInput = {
    buyerName: watchedValues.buyerName ?? session.user.displayName,
    buyerEmail: watchedValues.buyerEmail ?? session.user.email,
    walletId: watchedValues.walletId ?? firstWallet.id,
    walletProvider: watchedValues.walletProvider ?? firstWallet.provider,
    network: watchedValues.network ?? firstWallet.network,
  }
  const wallet = wallets.find((item) => item.id === values.walletId) ?? firstWallet

  function handleWalletChange(walletId: string) {
    const nextWallet = wallets.find((item) => item.id === walletId)
    if (!nextWallet) return
    form.setValue('walletId', nextWallet.id, { shouldValidate: true })
    form.setValue('network', nextWallet.network)
    form.setValue('walletProvider', nextWallet.provider)
  }

  async function confirmOrder() {
    if (!quote.data || quote.isFetching) return
    setRevalidationMessage(null)
    try {
      const order = await createOrder.mutateAsync({ ...form.getValues(), quoteId: quote.data.id })
      await navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'conflict') {
        setRevalidationMessage(error.message)
        // Atualiza os itens e a cotação juntos: a revisão precisa mostrar o mesmo
        // preço e estoque que serão usados na segunda confirmação.
        await Promise.all([cartQuery.refetch(), quote.refetch()])
      }
    }
  }

  if (etapa === 'revisao') {
    return (
      <>
        <PageHeader title="Revisão do pedido" fallbackTo="/checkout" />
        <main className="mx-auto max-w-md px-6 pb-[calc(12rem+env(safe-area-inset-bottom))]">
          {quote.isPending && <QuoteSkeleton />}
          {quote.error && (
            <div role="alert" className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {quote.error.message}
              <Button variant="link" size="sm" onClick={() => quote.refetch()}>Tentar novamente</Button>
            </div>
          )}
          {(revalidationMessage || createOrder.error) && (
            <p role="alert" className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
              {revalidationMessage ?? createOrder.error?.message}
            </p>
          )}
          {quote.data?.issues.length ? (
            <p role="status" className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
              Preço ou disponibilidade mudou. Confira os valores abaixo e confirme novamente.
            </p>
          ) : null}
          {quote.data && (
            <CheckoutReview
              items={cart.items}
              buyer={{ name: values.buyerName, email: values.buyerEmail }}
              wallet={wallet}
              provider={values.walletProvider}
              network={values.network}
              totals={quote.data}
            />
          )}
        </main>
        <BottomActions>
          <Button
            size="lg"
            className="rounded-full"
            onClick={confirmOrder}
            disabled={!quote.data || quote.isFetching || createOrder.isPending}
          >
            {createOrder.isPending ? 'Enviando pedido…' : hasOpenAttempt ? 'Recuperar pedido' : quote.data?.issues.length ? 'Confirmar alterações e comprar' : 'Confirmar compra'}
          </Button>
          <Button variant="link" asChild disabled={createOrder.isPending}>
            <Link to="/checkout" search={{}}>Editar pagamento</Link>
          </Button>
        </BottomActions>
      </>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(() => navigate({ to: '/checkout', search: { etapa: 'revisao' } }))}>
      <PageHeader title="Pagamento com carteira" fallbackTo="/carrinho" />
      <main className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Carteira conectada</h2>
            <Link to="/conta/carteiras" className="rounded-sm text-sm font-bold text-highlight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">Trocar carteira</Link>
          </div>
          <WalletOptions wallets={wallets} selectedId={wallet.id} onSelect={handleWalletChange} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-bold">Carteira e rede</h2>
          <ProviderOptions selected={values.walletProvider} onSelect={(provider) => form.setValue('walletProvider', provider as WalletProvider)} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="checkout-network">Rede</Label>
            <Select value={values.network} onValueChange={(network) => form.setValue('network', network as Network)}>
              <SelectTrigger id="checkout-network" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {networkSchema.options.map((option) => <SelectItem key={option} value={option}>{networkLabels[option]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold">Dados do colecionador</h2>
          <Label htmlFor="buyer-name" className="sr-only">Nome</Label>
          <Input id="buyer-name" autoComplete="name" placeholder="Nome" {...form.register('buyerName')} aria-invalid={!!form.formState.errors.buyerName} />
          {form.formState.errors.buyerName && <p role="alert" className="text-xs text-destructive">{form.formState.errors.buyerName.message}</p>}
          <Label htmlFor="buyer-email" className="sr-only">E-mail</Label>
          <Input id="buyer-email" type="email" autoComplete="email" placeholder="E-mail" {...form.register('buyerEmail')} aria-invalid={!!form.formState.errors.buyerEmail} />
          {form.formState.errors.buyerEmail && <p role="alert" className="text-xs text-destructive">{form.formState.errors.buyerEmail.message}</p>}
        </section>

        {quote.data ? (
          <p className="flex items-baseline justify-end gap-4 font-bold">Total: <EthAmount value={quote.data.total} className="text-xl text-highlight" /></p>
        ) : <QuoteSkeleton />}
      </main>
      <BottomActions>
        <Button type="submit" size="lg" className="rounded-full" disabled={!quote.data || quote.isFetching}>Revisar pedido</Button>
      </BottomActions>
    </form>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="min-h-dvh">
      <PageHeader title="Pagamento com carteira" fallbackTo="/carrinho" />
      <main aria-busy="true" aria-label="Carregando checkout" className="mx-auto flex max-w-md flex-col gap-6 px-6">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20" />)}
      </main>
    </div>
  )
}

function QuoteSkeleton() {
  return <Skeleton aria-label="Atualizando valores" className="h-28 w-full" />
}

function BottomActions({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-linear-to-t from-background via-background to-transparent pt-6 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md flex-col gap-1 px-6 pb-5">{children}</div>
    </div>
  )
}
