import { HttpResponse } from 'msw'
import type { ApiErrorBody } from '@/api/error'

/** Resposta de erro no formato do contrato (o mesmo schema que o interceptor do Axios valida). */
export function errorResponse(status: number, body: ApiErrorBody) {
  return HttpResponse.json(body satisfies ApiErrorBody, { status })
}
