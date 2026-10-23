import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { WalletSection } from '@/features/account/WalletSection'
import { users, walletsByUserId } from '@/mocks/fixtures/users' // fase 1: vira hook de Query na fase 2

// TEMPORÁRIO (fase 1): ?usuario=theo mostra o estado "sem carteira secundária" (sem login ainda)
const walletsSearchSchema = z.object({ usuario: z.enum(['nova', 'theo']).optional().catch(undefined) })

export const Route = createFileRoute('/_tabs/conta/carteiras')({
  validateSearch: walletsSearchSchema,
  component: WalletsPage,
})

function WalletsPage() {
  const { usuario } = Route.useSearch()
  const user = users.find((item) => item.id === `user-${usuario ?? 'nova'}`) ?? users[0]!
  const wallets = walletsByUserId[user.id] ?? []

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
      {/* key: trocar de usuário remonta as seções e fecha formulários abertos */}
      <WalletSection key={`${user.id}-primary`} slot="primary" wallet={wallets.find((wallet) => wallet.slot === 'primary')} />
      <WalletSection key={`${user.id}-secondary`} slot="secondary" wallet={wallets.find((wallet) => wallet.slot === 'secondary')} />
    </div>
  )
}
