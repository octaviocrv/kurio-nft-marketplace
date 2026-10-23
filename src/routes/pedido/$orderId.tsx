import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Clock, X, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Order } from '@/api/order'
import { EthAmount } from '@/components/EthAmount'
import { Button } from '@/components/ui/button'
import { networkLabels } from '@/features/catalog/labels'
import { walletProviderLabels } from '@/features/checkout/labels'
import { OrderReceipt } from '@/features/checkout/OrderReceipt'
import { ThankYouIllustration } from '@/features/checkout/ThankYouIllustration'
import { formatDate } from '@/lib/date'
import { getExplorer, shortenAddress } from '@/lib/wallet'
import { demoOrders } from '@/mocks/fixtures/orders' // fase 1: vira hook de Query (com polling do status) na fase 2

export const Route = createFileRoute('/pedido/$orderId')({
  loader: ({ params }) => {
    const order = demoOrders.find((item) => item.id === params.orderId)
    if (!order) throw notFound()
    return order
  },
  component: OrderPage,
  notFoundComponent: OrderNotFound,
})

// Sem frame mobile no Figma: adapta o modal desktop de confirmação para tela cheia
function OrderPage() {
  const order = Route.useLoaderData()

  return (
    <>
      <header className="flex justify-end px-6 pt-6">
        {/* Fechar, não "voltar": depois de pagar, voltar ao checkout não faz sentido */}
        <Button variant="secondary" size="icon" className="rounded-full text-muted-foreground" asChild>
          <Link to="/" aria-label="Fechar e voltar ao início">
            <X className="size-5" />
          </Link>
        </Button>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-10">
        {order.status === 'confirmed' && <ConfirmedOrder order={order} />}
        {order.status === 'pending' && <PendingOrder order={order} />}
        {order.status === 'rejected' && <RejectedOrder order={order} />}
      </main>
    </>
  )
}

// O tipo Order é uma união por status: aqui o TypeScript garante que hash e data de confirmação existem
function ConfirmedOrder({ order }: { order: Extract<Order, { status: 'confirmed' }> }) {
  const explorer = getExplorer(order.network, order.transactionHash)

  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
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

function PendingOrder({ order }: { order: Order }) {
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
    // role="status": leitor de tela anuncia quando o pedido muda de estado (polling na fase 2)
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

function OrderNotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 pt-24 text-center">
      <h1 className="text-xl font-bold">Pedido não encontrado</h1>
      <p className="text-sm text-muted-foreground">Confira o link ou acompanhe seus pedidos pelo perfil.</p>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </main>
  )
}
