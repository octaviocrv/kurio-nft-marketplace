import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { z } from 'zod'
import { networkSchema, type Network, type WalletProvider } from '@/api/shared'
import { EthAmount } from '@/components/EthAmount'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { networkLabels } from '@/features/catalog/labels'
import { CheckoutReview } from '@/features/checkout/CheckoutReview'
import { ProviderOptions } from '@/features/checkout/ProviderOptions'
import { WalletOptions } from '@/features/checkout/WalletOptions'
import { requireSession } from '@/features/auth/queries'
import { multiplyWei, parseEth, sumWei, toEthString } from '@/lib/eth'
// fase 1: viram hooks de Query (sessão, carteiras, carrinho/cotação) na fase 2
import { DEMO_NETWORK_FEE, demoCartItems } from '@/mocks/fixtures/carts'
import { users, walletsByUserId } from '@/mocks/fixtures/users'

// A etapa vive na URL: refresh e botão voltar do navegador respeitam onde o usuário estava.
// Opcional: /checkout sem parâmetro é o pagamento; valor inválido também cai nele.
const checkoutSearchSchema = z.object({
  etapa: z.enum(['pagamento', 'revisao']).optional().catch(undefined),
})

export const Route = createFileRoute('/checkout')({
  validateSearch: checkoutSearchSchema,
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location.href),
  component: CheckoutPage,
})

const demoUser = users[0]!
const demoWallets = walletsByUserId[demoUser.id] ?? []

function CheckoutPage() {
  const { etapa } = Route.useSearch()
  const navigate = useNavigate()

  const [walletId, setWalletId] = useState(demoWallets[0]?.id ?? '')
  const [provider, setProvider] = useState<WalletProvider>(demoWallets[0]?.provider ?? 'metamask')
  const [network, setNetwork] = useState<Network>(demoWallets[0]?.network ?? 'ethereum')
  const [buyer, setBuyer] = useState({ name: demoUser.displayName, email: demoUser.email })

  const wallet = demoWallets.find((item) => item.id === walletId)
  const subtotalWei = sumWei(demoCartItems.map((item) => multiplyWei(parseEth(item.unitPrice), item.quantity)))
  const totals = {
    subtotal: toEthString(subtotalWei),
    discount: '0',
    networkFee: DEMO_NETWORK_FEE,
    total: toEthString(subtotalWei + parseEth(DEMO_NETWORK_FEE)),
  }

  function handleWalletChange(nextWalletId: string) {
    setWalletId(nextWalletId)
    // Cada carteira já tem uma rede e um provedor: trocar de carteira traz os dela
    const nextWallet = demoWallets.find((item) => item.id === nextWalletId)
    if (nextWallet) {
      setNetwork(nextWallet.network)
      setProvider(nextWallet.provider)
    }
  }

  if (etapa === 'revisao' && wallet) {
    return (
      <>
        <PageHeader title="Revisão do pedido" fallbackTo="/checkout" />
        <main className="mx-auto max-w-md px-6 pb-[calc(10rem+env(safe-area-inset-bottom))]">
          <CheckoutReview items={demoCartItems} buyer={buyer} wallet={wallet} provider={provider} network={network} totals={totals} />
        </main>
        <BottomActions>
          {/* Fase 1: só navega. Na fase 2: cria o pedido com chave de idempotência e acompanha o status. */}
          <Button size="lg" className="rounded-full" onClick={() => navigate({ to: '/pedido/$orderId', params: { orderId: 'ord-1001' } })}>
            Confirmar compra
          </Button>
          <Button variant="link" asChild>
            <Link to="/checkout" search={{}}>Editar pagamento</Link>
          </Button>
        </BottomActions>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Pagamento com carteira" fallbackTo="/carrinho" />
      <main className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Carteira conectada</h2>
            <Link to="/conta/carteiras" className="rounded-sm text-sm font-bold text-highlight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              Trocar carteira
            </Link>
          </div>
          <WalletOptions wallets={demoWallets} selectedId={walletId} onSelect={handleWalletChange} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-bold">Carteira e rede</h2>
          <ProviderOptions selected={provider} onSelect={setProvider} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="checkout-network">Rede</Label>
            <Select value={network} onValueChange={(value) => setNetwork(value as Network)}>
              <SelectTrigger id="checkout-network" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {networkSchema.options.map((option) => (
                  <SelectItem key={option} value={option}>{networkLabels[option]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Enunciado pede "dados do colecionador" no pagamento; o Figma mobile não tem: segue o padrão dos formulários */}
        <section className="flex flex-col gap-3">
          <h2 className="font-bold">Dados do colecionador</h2>
          <Label htmlFor="buyer-name" className="sr-only">Nome</Label>
          <Input id="buyer-name" autoComplete="name" placeholder="Nome" value={buyer.name} onChange={(event) => setBuyer({ ...buyer, name: event.target.value })} />
          <Label htmlFor="buyer-email" className="sr-only">E-mail</Label>
          <Input id="buyer-email" type="email" autoComplete="email" placeholder="E-mail" value={buyer.email} onChange={(event) => setBuyer({ ...buyer, email: event.target.value })} />
        </section>

        <p className="flex items-baseline justify-end gap-4 font-bold">
          Total: <EthAmount value={totals.total} className="text-xl text-highlight" />
        </p>
      </main>
      <BottomActions>
        <Button size="lg" className="rounded-full" onClick={() => navigate({ to: '/checkout', search: { etapa: 'revisao' } })}>
          Revisar pedido
        </Button>
      </BottomActions>
    </>
  )
}

function BottomActions({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-linear-to-t from-background via-background to-transparent pt-6 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md flex-col gap-1 px-6 pb-5">{children}</div>
    </div>
  )
}
