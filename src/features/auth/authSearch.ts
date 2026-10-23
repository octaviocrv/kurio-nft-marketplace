import { z } from 'zod'

/**
 * ?redirect= do login/cadastro: para onde voltar depois de autenticar.
 * Só aceita caminho interno ("/checkout"), nunca "//site.com" ou "https://...": sem isso,
 * um link malicioso poderia mandar o usuário para fora do app logo após o login (open redirect).
 * Valor inválido é descartado em vez de quebrar a página.
 */
export const authSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
})
