import axios, { isAxiosError, isCancel } from 'axios'
import type { z } from 'zod'
import { ApiError, apiErrorBodySchema, type ApiErrorCode } from './error'

/**
 * Cliente HTTP único do app. Todas as funções de src/api passam por aqui.
 * O app não sabe se do outro lado está o MSW ou um backend real: só conhece /api.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  // Sem limite, um servidor travado deixaria o checkout esperando para sempre.
  // O cenário order-timeout depende disso: o pedido é criado, a resposta não chega a tempo
  // e o cliente reenvia com a mesma chave de idempotência.
  timeout: 8000,
})

// 401 de sessão precisa sair da camada HTTP (limpar sessão, mandar para o login), mas o
// cliente não conhece o router nem o cache. Quem sabe fazer isso registra o handler aqui.
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

apiClient.interceptors.response.use(undefined, (error: unknown) => {
  // Cancelamento não é erro: o TanStack Query cancela consultas obsoletas e precisa ver o erro original
  if (isCancel(error)) return Promise.reject(error)

  const apiError = toApiError(error)
  if (apiError.code === 'unauthorized') unauthorizedHandler?.()
  return Promise.reject(apiError)
})

function toApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return new ApiError(0, { code: 'network_error', message: 'Erro inesperado. Tente novamente.' })
  }

  if (error.response) {
    const { status, data } = error.response
    const body = apiErrorBodySchema.safeParse(data)
    // Resposta fora do contrato (ex.: HTML de erro de um proxy) ainda vira um erro tipado
    return new ApiError(status, body.success ? body.data : { code: codeFromStatus(status), message: 'Não foi possível concluir a operação.' })
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError(0, { code: 'timeout', message: 'O servidor demorou para responder. Tente novamente.' })
  }

  return new ApiError(0, { code: 'network_error', message: 'Sem conexão com o servidor. Verifique sua internet.' })
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 422 || status === 400) return 'validation_error'
  return 'server_error'
}

/**
 * Valida a resposta contra o schema do contrato. Resposta fora do contrato vira ApiError
 * (e não um erro do zod): hooks e telas continuam lidando com um único tipo de erro.
 */
export function parseResponse<Schema extends z.ZodType>(schema: Schema, data: unknown): z.infer<Schema> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ApiError(200, { code: 'server_error', message: 'Resposta inesperada do servidor.' })
  }
  return result.data
}
