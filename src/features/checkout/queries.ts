import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { connectWallet, disconnectWallet, fetchWallets } from '@/api/wallet'

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

// Conectar uma carteira desconecta as outras, então a lista inteira vem de novo do servidor.
// Devolver a promise mantém a mutation "pendente" até a tela já mostrar o estado novo.
export function useConnectWallet(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (walletId: string) => connectWallet(walletId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all(userId) }),
  })
}

export function useDisconnectWallet(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (walletId: string) => disconnectWallet(walletId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all(userId) }),
  })
}
