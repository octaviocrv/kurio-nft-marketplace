import { db } from './db'

/** Nome ENS é único: outro usuário (no perfil ou numa carteira) não pode usar o mesmo nome. */
export function isEnsTakenByOthers(ensName: string, userId: string): boolean {
  const name = ensName.toLowerCase()
  const usedByProfile = db.users.some((user) => user.id !== userId && user.ensName?.toLowerCase() === name)
  const usedByWallet = Object.entries(db.walletsByUserId).some(
    ([ownerId, wallets]) => ownerId !== userId && wallets.some((wallet) => wallet.ensName?.toLowerCase() === name),
  )
  return usedByProfile || usedByWallet
}
