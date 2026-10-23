import { z } from 'zod'
import { dateTimeSchema, ensNameSchema, idSchema } from './shared'

// Senha nunca faz parte do usuário: entra só nos formulários e o mock guarda apenas o hash.
export const userSchema = z.object({
  id: idSchema,
  username: z.string().min(3),
  displayName: z.string().min(1),
  email: z.email(),
  ensName: ensNameSchema.nullable(),
  avatarUrl: z.string().nullable(),
})
export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: dateTimeSchema,
  user: userSchema,
})
export type Session = z.infer<typeof sessionSchema>
