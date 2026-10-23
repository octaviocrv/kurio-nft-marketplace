import { useQuery } from '@tanstack/react-query'
import { fetchWallets } from '@/api/wallet'

export const walletKeys = {
  all: (userId: string) => ['wallets', userId] as const,
}

export function useWallets(userId: string | undefined) {
  return useQuery({
    queryKey: walletKeys.all(userId ?? 'pending'),
    queryFn: ({ signal }) => fetchWallets(signal),
    enabled: userId !== undefined,
  })
}
