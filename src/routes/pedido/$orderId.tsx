import { createFileRoute, Link } from '@tanstack/react-router'
import { Clock, SearchX, X, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Order } from '@/api/order'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { EthAmount } from '@/components/EthAmount'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { requireSession, useSession } from '@/features/auth/queries'
import { networkLabels } from '@/features/catalog/labels'
import { walletProviderLabels } from '@/features/checkout/labels'
import { OrderReceipt } from '@/features/checkout/OrderReceipt'
import { ThankYouIllustration } from '@/features/checkout/ThankYouIllustration'
import { useOrder } from '@/features/order/queries'
import { formatDate } from '@/lib/date'
import { getExplorer, shortenAddress } from '@/lib/wallet'

export const Route = createFileRoute('/pedido/$orderId')({
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location.href),
  component: OrderPage,
})

function OrderPage() {
  const { orderId } = Route.useParams()
  const session = useSession()
  const order = useOrder(orderId, session.data?.user.id)

  if (session.isPending || order.isPending) return <OrderSkeleton />
  if (order.error?.code === 'not_found') return <OrderNotFound />
  // Falha ao atualizar um pedido que já está na tela (queda de conexão) não derruba a tela: veja o aviso abaixo
  const blockingError = session.error ?? (order.data ? null : order.error)
  if (blockingError) {
    const error = blockingError
    return (
      <main className="flex min-h-dvh flex-col">
        <ErrorState
          title="Não foi possível acompanhar o pedido"
          description={error?.message ?? 'Tente novamente.'}
          onRetry={() => void Promise.all([session.refetch(), order.refetch()])}
          isRetrying={session.isFetching || order.isFetching}
        />
      </main>
    )
  }
  if (!order.data) return null

  return (
    <>
      <header className="flex justify-end px-6 pt-6">
        {/* Fechar, não "voltar": depois de pagar, voltar ao checkout não faz sentido. */}
        <Button variant="secondary" size="icon" className="rounded-full text-muted-foreground" asChild>
          <Link to="/" aria-label="Fechar e voltar ao início">
            <X className="size-5" />
          </Link>
        </Button>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-10">
        {order.isRefetchError && (
          <p role="status" className="rounded-lg bg-primary/10 px-4 py-3 text-center text-sm text-primary">
            Sem conexão com o servidor. Vamos atualizar o pedido assim que a conexão voltar.
          </p>
        )}
        {order.data.status === 'confirmed' && <ConfirmedOrder order={order.data} />}
        {order.data.status === 'pending' && <PendingOrder order={order.data} />}
        {order.data.status === 'rejected' && <RejectedOrder order={order.data} />}
      </main>
    </>
  )
}

function ConfirmedOrder({ order }: { order: Extract<Order, { status: 'confirmed' }> }) {
  const explorer = getExplorer(order.network, order.transactionHash)

  return (
    <>
      {/* role="status": a confirmação chega sozinha (socket) e precisa ser anunciada ao leitor de tela */}
      <div role="status" className="flex flex-col items-center gap-4 text-center">
        <ThankYouIllustration className="h-20 text-highlight" />
        <h1 className="font-bold text-muted-foreground">Seus NFTs agora estão na sua carteira</h1>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-primary py-4 text-sm">
        <MetaItem label="ID da transação" value={shortenAddress(order.transactionHash)} />
        <MetaItem label="Data" value={formatDate(order.confirmedAt)} />
        <MetaItem label="Total" value={<EthAmount value={order.total} />} />
        <MetaItem label="Carteira" value={walletProviderLabels[order.walletProvider]} />
      </dl>

      <OrderReceipt order={order} />

      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        Transação confirmada na {networkLabels[order.network]}. A propriedade foi transferida para sua carteira conectada e registrada na rede.
      </p>
      <Button asChild className="self-center">
        <a href={explorer.url} target="_blank" rel="noopener noreferrer">
          Ver no {explorer.name}
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </Button>
      <div aria-hidden className="h-2 rounded-full bg-primary" />
    </>
  )
}

function PendingOrder({ order }: { order: Extract<Order, { status: 'pending' }> }) {
  return (
    <>
      <StatusHeader
        icon={<Clock className="size-8 motion-safe:animate-pulse" />}
        title="Pagamento em processamento"
        description="Aguardando a confirmação da rede. Esta página atualiza sozinha quando o status mudar."
      />
      <OrderReceipt order={order} />
    </>
  )
}

function RejectedOrder({ order }: { order: Extract<Order, { status: 'rejected' }> }) {
  return (
    <>
      <StatusHeader
        icon={<XCircle className="size-8 text-destructive" />}
        title="Pagamento recusado"
        description={`${order.rejectionReason} Seus itens continuam no carrinho.`}
      />
      <Button asChild size="lg" className="rounded-full">
        <Link to="/carrinho">Voltar ao carrinho</Link>
      </Button>
      <OrderReceipt order={order} />
    </>
  )
}

function StatusHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 rounded-xl bg-card p-6 text-center">
      <span className="text-highlight">{icon}</span>
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function OrderSkeleton() {
  return (
    <main aria-busy="true" aria-label="Carregando pedido" className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-20">
      <Skeleton className="mx-auto size-20 rounded-full" />
      <Skeleton className="h-28" />
      <Skeleton className="h-48" />
    </main>
  )
}

function OrderNotFound() {
  return (
    <main className="flex min-h-dvh flex-col">
      <EmptyState
        icon={<SearchX />}
        title="Pedido não encontrado"
        description="Confira o link ou acompanhe seus pedidos pelo perfil."
        action={{ label: 'Voltar ao início', to: '/' }}
      />
    </main>
  )
}
