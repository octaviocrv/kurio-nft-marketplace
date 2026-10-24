import { http, HttpResponse } from 'msw'
import type { ApiErrorBody } from '@/api/error'
import { changePasswordInputSchema, updateProfileInputSchema } from '@/api/profile'
import { userSchema } from '@/api/user'
import { db, saveDb } from '../db'
import { isEnsTakenByOthers } from '../ensRegistry'
import { errorResponse } from '../http'
import { fieldErrors, hashPassword, randomHex, readBody, sessionFromRequest } from './auth'

function currentUser(request: Request) {
  const session = sessionFromRequest(request)
  return session ? db.users.find((user) => user.id === session.userId) : undefined
}

const unauthorized = () => errorResponse(401, { code: 'unauthorized', message: 'Entre para acessar seu perfil.' })

export const profileHandlers = [
  http.get('/api/profile', ({ request }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    return HttpResponse.json(userSchema.parse(user))
  }),

  http.patch('/api/profile', async ({ request }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    const parsed = updateProfileInputSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Revise os dados do perfil.', fieldErrors: fieldErrors(parsed.error.issues) })
    }

    const email = parsed.data.email.toLowerCase()
    const username = parsed.data.username.toLowerCase()
    const others = db.users.filter((item) => item.id !== user.id)
    const conflicts: NonNullable<ApiErrorBody['fieldErrors']> = {}
    if (others.some((item) => item.email.toLowerCase() === email)) conflicts.email = 'Este e-mail já está cadastrado'
    if (others.some((item) => item.username.toLowerCase() === username)) conflicts.username = 'Este nome de usuário já está em uso'
    if (parsed.data.ensName && isEnsTakenByOthers(parsed.data.ensName, user.id)) conflicts.ensName = 'Este nome ENS já está em uso'
    if (Object.keys(conflicts).length > 0) {
      return errorResponse(409, { code: 'conflict', message: 'Alguns dados já estão em uso.', fieldErrors: conflicts })
    }

    // Mesma normalização do cadastro: e-mail sempre em minúsculas
    Object.assign(user, { ...parsed.data, email })
    saveDb()
    return HttpResponse.json(userSchema.parse(user))
  }),

  http.post('/api/profile/password', async ({ request }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    const parsed = changePasswordInputSchema.safeParse(await readBody(request))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Revise os dados da senha.', fieldErrors: fieldErrors(parsed.error.issues) })
    }

    const currentMatches = (await hashPassword(user.passwordSalt, parsed.data.currentPassword)) === user.passwordHash
    if (!currentMatches) {
      // 422 e não 401: senha atual errada não é sessão expirada (401 desloga o usuário)
      return errorResponse(422, {
        code: 'validation_error',
        message: 'A senha atual está incorreta.',
        fieldErrors: { currentPassword: 'Senha atual incorreta' },
      })
    }

    user.passwordSalt = randomHex(8)
    user.passwordHash = await hashPassword(user.passwordSalt, parsed.data.newPassword)
    saveDb()
    return new HttpResponse(null, { status: 204 })
  }),
]
