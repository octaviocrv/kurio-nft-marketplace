import { delay, http, HttpResponse } from 'msw'
import type { ApiErrorBody } from '@/api/error'
import { createWalletInputSchema, walletInputSchema, walletListSchema, walletSchema, type Wallet, type WalletInput } from '@/api/wallet'
import { db, saveDb } from '../db'
import { isEnsTakenByOthers } from '../ensRegistry'
import { errorResponse } from '../http'
import { getScenario } from '../scenarios'
import { fieldErrors, readBody, sessionFromRequest } from './auth'

// Tempo que a "extensão da carteira" leva para aprovar ou recusar a conexão
const CONNECTION_DELAY_MS = 800

const unauthorized = () => errorResponse(401, { code: 'unauthorized', message: 'Entre para acessar suas carteiras.' })

/** Conflitos que o schema não enxerga: endereço repetido entre as carteiras do usuário e ENS de outra pessoa. */
function walletConflicts(input: WalletInput, ownWallets: Wallet[], userId: string) {
  const conflicts: NonNullable<ApiErrorBody['fieldErrors']> = {}
  if (ownWallets.some((wallet) => wallet.address.toLowerCase() === input.address.toLowerCase())) {
    conflicts.address = 'Este endereço já está em outra carteira sua'
  }
  if (input.ensName && isEnsTakenByOthers(input.ensName, userId)) conflicts.ensName = 'Este nome ENS já está em uso'
  return conflicts
}

function conflictResponse(conflicts: NonNullable<ApiErrorBody['fieldErrors']>) {
  return errorResponse(409, { code: 'conflict', message: 'Alguns dados já estão em uso.', fieldErrors: conflicts })
}

export const walletHandlers = [
  http.get('/api/wallets', ({ request }) => {
    const session = sessionFromRequest(request)
    if (!session) return unauthorized()
    // Principal sempre primeiro: o checkout seleciona a primeira da lista
    const items = [...(db.walletsByUserId[session.userId] ?? [])].sort((a, b) => Number(b.slot === 'primary') - Number(a.slot === 'primary'))
    return HttpResponse.json(walletListSchema.parse({ items }))
  }),

  http.post('/api/wallets', async ({ request }) => {
    const session = sessionFromRequest(request)
    if (!session) return unauthorized()
    const parsed = createWalletInputSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Revise os dados da carteira.', fieldErrors: fieldErrors(parsed.error.issues) })
    }

    const wallets = (db.walletsByUserId[session.userId] ??= [])
    if (wallets.some((wallet) => wallet.slot === parsed.data.slot)) {
      return errorResponse(409, { code: 'conflict', message: 'Você já tem uma carteira neste lugar. Edite a existente.' })
    }
    const conflicts = walletConflicts(parsed.data, wallets, session.userId)
    if (Object.keys(conflicts).length > 0) return conflictResponse(conflicts)

    const wallet = walletSchema.parse({ id: `wallet-${crypto.randomUUID()}`, ...parsed.data, connected: false })
    wallets.push(wallet)
    saveDb()
    return HttpResponse.json(wallet, { status: 201 })
  }),

  http.patch('/api/wallets/:walletId', async ({ request, params }) => {
    const session = sessionFromRequest(request)
    if (!session) return unauthorized()
    const parsed = walletInputSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Revise os dados da carteira.', fieldErrors: fieldErrors(parsed.error.issues) })
    }

    // Só enxerga carteiras do próprio usuário: a de outra pessoa responde como inexistente
    const wallets = db.walletsByUserId[session.userId] ?? []
    const wallet = wallets.find((item) => item.id === String(params.walletId))
    if (!wallet) return errorResponse(404, { code: 'not_found', message: 'Carteira não encontrada.' })
    const conflicts = walletConflicts(parsed.data, wallets.filter((item) => item.id !== wallet.id), session.userId)
    if (Object.keys(conflicts).length > 0) return conflictResponse(conflicts)

    Object.assign(wallet, parsed.data)
    saveDb()
    return HttpResponse.json(walletSchema.parse(wallet))
  }),

  http.post('/api/wallets/:walletId/connect', async ({ request, params }) => {
    const session = sessionFromRequest(request)
    if (!session) return unauthorized()
    const wallets = db.walletsByUserId[session.userId] ?? []
    const wallet = wallets.find((item) => item.id === String(params.walletId))
    if (!wallet) return errorResponse(404, { code: 'not_found', message: 'Carteira não encontrada.' })

    await delay(CONNECTION_DELAY_MS)
    if (getScenario() === 'wallet-rejected') {
      return errorResponse(403, { code: 'forbidden', message: 'A carteira recusou a conexão. Tente novamente.' })
    }
    // Uma carteira conectada por vez, como numa sessão real de carteira
    wallets.forEach((item) => { item.connected = item.id === wallet.id })
    saveDb()
    return HttpResponse.json(walletSchema.parse(wallet))
  }),

  http.post('/api/wallets/:walletId/disconnect', ({ request, params }) => {
    const session = sessionFromRequest(request)
    if (!session) return unauthorized()
    const wallet = (db.walletsByUserId[session.userId] ?? []).find((item) => item.id === String(params.walletId))
    if (!wallet) return errorResponse(404, { code: 'not_found', message: 'Carteira não encontrada.' })

    wallet.connected = false
    saveDb()
    return HttpResponse.json(walletSchema.parse(wallet))
  }),
]
