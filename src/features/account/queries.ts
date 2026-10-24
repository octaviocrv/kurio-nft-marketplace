import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { changePassword, fetchProfile, updateProfile, type ChangePasswordInput, type UpdateProfileInput } from '@/api/profile'
import type { Session } from '@/api/user'
import { createWallet, updateWallet, type CreateWalletInput, type Wallet, type WalletInput, type WalletList } from '@/api/wallet'
import { sessionKeys } from '@/features/auth/queries'
import { walletKeys } from '@/features/checkout/queries'

export const profileKeys = {
  detail: (userId: string) => ['profile', userId] as const,
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? 'pending'),
    queryFn: ({ signal }) => fetchProfile(signal),
    enabled: userId !== undefined,
  })
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(profileKeys.detail(userId), user)
      // Cabeçalho e checkout leem o usuário da sessão: os dois precisam mostrar o mesmo que o perfil
      queryClient.setQueryData<Session>(sessionKeys.current, (session) => session && { ...session, user })
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: (input: ChangePasswordInput) => changePassword(input) })
}

/** Coloca a carteira salva na lista em cache (principal primeiro, como a API responde). */
function storeWallet(queryClient: QueryClient, userId: string, wallet: Wallet) {
  queryClient.setQueryData<WalletList>(walletKeys.all(userId), (list) => {
    if (!list) return list
    const items = [...list.items.filter((item) => item.id !== wallet.id), wallet]
    return { items: items.sort((a, b) => Number(b.slot === 'primary') - Number(a.slot === 'primary')) }
  })
}

export function useCreateWallet(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWalletInput) => createWallet(input),
    onSuccess: (wallet) => storeWallet(queryClient, userId, wallet),
  })
}

export function useUpdateWallet(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ walletId, input }: { walletId: string; input: WalletInput }) => updateWallet(walletId, input),
    onSuccess: (wallet) => storeWallet(queryClient, userId, wallet),
  })
}
