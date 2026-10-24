import type { User } from '@/api/user'
import type { Wallet } from '@/api/wallet'

/*
 * Usuários de demonstração (credenciais documentadas no README):
 *   nova@kurio.dev / kurio123 — carteira principal e secundária
 *   theo@kurio.dev / kurio123 — só a principal (mostra o estado "sem carteira secundária")
 *
 * Senha nunca fica em claro no "banco": guardamos SHA-256(salt + senha) em hex.
 * O mock recalcula com WebCrypto no login. (Num backend real seria bcrypt/argon2;
 * aqui o objetivo é só não manter a senha legível.)
 */
export interface UserRecord extends User {
  passwordSalt: string
  passwordHash: string
}

export const users: UserRecord[] = [
  {
    id: 'user-nova',
    username: 'novasato',
    displayName: 'Nova Sato',
    email: 'nova@kurio.dev',
    ensName: 'nova.kurio.eth',
    avatarUrl: '/images/avatars/nova.webp',
    passwordSalt: 'b7e1c94a2f6d3058',
    passwordHash: '0d6b5ba9756e94a0a318ccecd73a33f0821da78eff8d1a518038c022857e20f6',
  },
  {
    id: 'user-theo',
    username: 'theomartins',
    displayName: 'Theo Martins',
    email: 'theo@kurio.dev',
    ensName: null,
    avatarUrl: null,
    passwordSalt: '4c2a9e17d08f5b63',
    passwordHash: '4eb4da99cf99db44a10e7f54498e461ac0e3c9a7f141f320ce1206d9924ebf71',
  },
]

/** Carteiras por usuário (o contrato Wallet não tem userId: a API sempre responde as da sessão). */
export const walletsByUserId: Record<string, Wallet[]> = {
  'user-nova': [
    {
      id: 'wallet-nova-primary',
      slot: 'primary',
      nickname: 'Principal',
      address: '0xA91F5ee4cb2db86639e6721e97bd1a5ef4d5E82C',
      ensName: null,
      network: 'ethereum',
      provider: 'metamask',
      connected: true,
    },
    {
      id: 'wallet-nova-secondary',
      slot: 'secondary',
      nickname: 'Reserva',
      address: '0x0a052768fb1895cf3f87dc0a8c43ff6d1997b601',
      ensName: 'nova.kurio.eth',
      network: 'polygon',
      provider: 'coinbase',
      connected: false,
    },
  ],
  'user-theo': [
    {
      id: 'wallet-theo-primary',
      slot: 'primary',
      nickname: 'Principal',
      address: '0xa53c53d630cf376a8ab0c4641221ef19d48227e2',
      ensName: null,
      network: 'ethereum',
      provider: 'walletconnect',
      connected: true,
    },
  ],
}
