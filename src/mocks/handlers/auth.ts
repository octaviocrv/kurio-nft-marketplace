import { http, HttpResponse } from 'msw'
import { loginInputSchema, registerInputSchema } from '@/api/auth'
import type { ApiErrorBody } from '@/api/error'
import { sessionSchema, userSchema, type Session, type User } from '@/api/user'
import { db, saveDb } from '../db'
import { mergeGuestCart } from '../cartStore'
import { errorResponse } from '../http'
import { getScenario } from '../scenarios'

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  return Object.fromEntries(issues.map((issue) => [issue.path.join('.'), issue.message]))
}

async function readBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(salt: string, password: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function publicUser(userId: string): User {
  return userSchema.parse(db.users.find((item) => item.id === userId))
}

function createSession(userId: string): Session {
  const token = `session-${crypto.randomUUID()}`
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  db.sessions[token] = { userId, expiresAt }
  saveDb()
  return sessionSchema.parse({ token, expiresAt, user: publicUser(userId) })
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

function unauthorized(message = 'Sua sessão expirou. Entre novamente.') {
  return errorResponse(401, { code: 'unauthorized', message })
}

export function sessionFromRequest(request: Request): { userId: string; token: string } | null {
  const token = bearerToken(request)
  if (!token) return null
  const session = db.sessions[token]
  if (!session || Date.parse(session.expiresAt) <= Date.now()) {
    if (session) {
      delete db.sessions[token]
      saveDb()
    }
    return null
  }
  return { userId: session.userId, token }
}

export const authHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    const parsed = registerInputSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Revise os dados do cadastro.', fieldErrors: fieldErrors(parsed.error.issues) })
    }

    const email = parsed.data.email.toLowerCase()
    const username = parsed.data.username.toLowerCase()
    const conflicts: NonNullable<ApiErrorBody['fieldErrors']> = {}
    if (db.users.some((user) => user.email.toLowerCase() === email)) conflicts.email = 'Este e-mail já está cadastrado'
    if (db.users.some((user) => user.username.toLowerCase() === username)) conflicts.username = 'Este nome de usuário já está em uso'
    if (Object.keys(conflicts).length > 0) {
      return errorResponse(409, { code: 'conflict', message: 'Já existe uma conta com esses dados.', fieldErrors: conflicts })
    }

    const salt = randomHex(8)
    const id = `user-${crypto.randomUUID()}`
    db.users.push({
      id,
      username: parsed.data.username,
      displayName: parsed.data.username,
      email,
      ensName: null,
      avatarUrl: null,
      passwordSalt: salt,
      passwordHash: await hashPassword(salt, parsed.data.password),
    })
    db.walletsByUserId[id] = []
    db.favoriteIdsByUserId[id] = []
    mergeGuestCart(request.headers.get('X-Guest-Id'), id)
    saveDb()
    return HttpResponse.json(createSession(id), { status: 201 })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const parsed = loginInputSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Revise os dados de acesso.', fieldErrors: fieldErrors(parsed.error.issues) })
    }

    const user = db.users.find((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase())
    const passwordMatches = user && (await hashPassword(user.passwordSalt, parsed.data.password)) === user.passwordHash
    if (!user || !passwordMatches) {
      return errorResponse(401, { code: 'invalid_credentials', message: 'E-mail ou senha incorretos.' })
    }
    mergeGuestCart(request.headers.get('X-Guest-Id'), user.id)
    return HttpResponse.json(createSession(user.id))
  }),

  http.get('/api/session', ({ request }) => {
    if (getScenario() === 'session-expired') return unauthorized()
    const auth = sessionFromRequest(request)
    if (!auth) return unauthorized('Entre para continuar.')
    const stored = db.sessions[auth.token]!
    return HttpResponse.json(sessionSchema.parse({ token: auth.token, expiresAt: stored.expiresAt, user: publicUser(auth.userId) }))
  }),

  http.post('/api/auth/logout', ({ request }) => {
    const token = bearerToken(request)
    if (token && db.sessions[token]) {
      delete db.sessions[token]
      saveDb()
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
