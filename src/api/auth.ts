import { z } from 'zod'
import { apiClient, parseResponse } from './client'
import { sessionSchema, type Session } from './user'

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Use pelo menos 3 caracteres')
  .max(24, 'Use no máximo 24 caracteres')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, ponto, hífen ou sublinhado')

export const emailSchema = z.email('Informe um e-mail válido')
export const passwordSchema = z.string().min(8, 'Use pelo menos 8 caracteres').max(72, 'Use no máximo 72 caracteres')

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha'),
})
export type LoginInput = z.infer<typeof loginInputSchema>

export const registerInputSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas precisam ser iguais',
  })
export type RegisterInput = z.infer<typeof registerInputSchema>

export async function login(input: LoginInput): Promise<Session> {
  const { data } = await apiClient.post('/auth/login', input)
  return parseResponse(sessionSchema, data)
}

export async function register(input: RegisterInput): Promise<Session> {
  const { data } = await apiClient.post('/auth/register', input)
  return parseResponse(sessionSchema, data)
}

export async function fetchSession(signal?: AbortSignal): Promise<Session> {
  const { data } = await apiClient.get('/session', { signal })
  return parseResponse(sessionSchema, data)
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
