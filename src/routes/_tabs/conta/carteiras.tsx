import { createFileRoute } from '@tanstack/react-router'
import type { Wallet } from '@/api/wallet'
import { ErrorState } from '@/components/ErrorState'
import { WalletsSkeleton } from '@/features/account/AccountSkeletons'
import { useCreateWallet, useUpdateWallet } from '@/features/account/queries'
import { WalletSection } from '@/features/account/WalletSection'
import { useSession } from '@/features/auth/queries'
import { useWallets } from '@/features/checkout/queries'

export const Route = createFileRoute('/_tabs/conta/carteiras')({
  component: WalletsPage,
})

function WalletsPage() {
  const session = useSession()
  const userId = session.data?.user.id
  const wallets = useWallets(userId)

  if (!userId || wallets.isPending) return <WalletsSkeleton />
  if (wallets.error) {
    return <ErrorState title="Não foi possível carregar suas carteiras" description={wallets.error.message} onRetry={() => void wallets.refetch()} isRetrying={wallets.isFetching} />
  }
  return <WalletsContent userId={userId} wallets={wallets.data.items} />
}

function WalletsContent({ userId, wallets }: { userId: string; wallets: Wallet[] }) {
  const createWallet = useCreateWallet(userId)
  const updateWallet = useUpdateWallet(userId)
  const primary = wallets.find((wallet) => wallet.slot === 'primary')
  const secondary = wallets.find((wallet) => wallet.slot === 'secondary')

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-sm text-muted-foreground">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
      {/* key: trocar de usuário remonta as seções e fecha formulários abertos */}
      <WalletSection
        key={`${userId}-primary`}
        slot="primary"
        wallet={primary}
        onSave={(input) => (primary ? updateWallet.mutateAsync({ walletId: primary.id, input }) : createWallet.mutateAsync({ ...input, slot: 'primary' }))}
      />
      <WalletSection
        key={`${userId}-secondary`}
        slot="secondary"
        wallet={secondary}
        onSave={(input) => (secondary ? updateWallet.mutateAsync({ walletId: secondary.id, input }) : createWallet.mutateAsync({ ...input, slot: 'secondary' }))}
      />
    </div>
  )
}
