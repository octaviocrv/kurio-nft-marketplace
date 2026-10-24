import { z } from 'zod'
import { emailSchema, passwordSchema, usernameSchema } from './auth'
import { apiClient, parseResponse } from './client'
import { ensNameSchema } from './shared'
import { userSchema, type User } from './user'

export const AVATAR_MAX_BYTES = 300 * 1024
export const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

/**
 * Avatar enviado vira data URL (sem servidor de arquivos no mock). Também aceita um asset do
 * próprio app (/images/...), que é o avatar do usuário de demonstração.
 * O limite é em caracteres: base64 ocupa 4/3 do arquivo, então equivale a AVATAR_MAX_BYTES.
 */
export const avatarUrlSchema = z
  .string()
  .regex(/^(data:image\/(png|jpeg|webp);base64,|\/images\/)/, 'Use uma imagem PNG, JPEG ou WebP')
  .max(Math.ceil((AVATAR_MAX_BYTES * 4) / 3) + 64, `Imagem muito grande (máximo de ${AVATAR_MAX_BYTES / 1024} KB)`)

export const updateProfileInputSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe seu nome').max(60, 'Use no máximo 60 caracteres'),
  username: usernameSchema,
  email: emailSchema,
  ensName: ensNameSchema.nullable(),
  avatarUrl: avatarUrlSchema.nullable(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>

const passwordFieldsSchema = z.object({
  currentPassword: z.string().min(1, 'Informe sua senha atual'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirme a nova senha'),
})

export const changePasswordInputSchema = passwordFieldsSchema.superRefine((input, ctx) => {
  if (input.newPassword !== input.confirmPassword) {
    ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'As senhas precisam ser iguais' })
  }
  if (input.newPassword === input.currentPassword) {
    ctx.addIssue({ code: 'custom', path: ['newPassword'], message: 'A nova senha deve ser diferente da atual' })
  }
})
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>

export async function fetchProfile(signal?: AbortSignal): Promise<User> {
  const { data } = await apiClient.get('/profile', { signal })
  return parseResponse(userSchema, data)
}

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const { data } = await apiClient.patch('/profile', input)
  return parseResponse(userSchema, data)
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.post('/profile/password', input)
}
