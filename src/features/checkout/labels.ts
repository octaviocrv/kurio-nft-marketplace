import type { WalletProvider } from '@/api/shared'

export const walletProviderLabels: Record<WalletProvider, string> = {
  walletconnect: 'WalletConnect',
  metamask: 'MetaMask',
  coinbase: 'Coinbase Wallet',
}
