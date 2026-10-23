import { z } from 'zod'

/**
 * Códigos de erro do contrato. Cobrem os casos que o enunciado exige da API
 * (validação, sessão inválida, permissão, inexistente, conflito, falha transitória)
 * mais os dois que só o cliente enxerga: sem conexão e tempo esgotado.
 */
export const apiErrorCodeSchema = z.enum([
  'validation_error', // 422, com fieldErrors
  'invalid_credentials', // 401 do login: senha errada não é "sessão expirada"
  'unauthorized', // 401: sem sessão, token inválido ou expirado
  'forbidden', // 403
  'not_found', // 404
  'conflict', // 409: cadastro duplicado, estoque, chave de idempotência reaproveitada
  'server_error', // 5xx
  'network_error', // sem resposta (offline, servidor fora)
  'timeout', // a requisição passou do tempo limite do Axios
])
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

/** Corpo de erro que a API responde. Os handlers do MSW montam erros com este mesmo schema. */
export const apiErrorBodySchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
  fieldErrors: z.record(z.string(), z.string()).optional(), // { email: 'E-mail já cadastrado' }
})
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>

/** Único tipo de erro que sai da camada de API. Hooks e telas nunca veem erro cru do Axios. */
export class ApiError extends Error {
  readonly status: number // 0 quando não houve resposta HTTP
  readonly code: ApiErrorCode
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.fieldErrors = body.fieldErrors
  }

  /** 4xx é resposta definitiva: repetir a mesma requisição dá o mesmo resultado. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }
}
