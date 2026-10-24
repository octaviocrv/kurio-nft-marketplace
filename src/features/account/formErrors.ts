import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/api/error'

/**
 * Leva os erros por campo da API para o formulário (o primeiro campo recebe o foco).
 * Sem erro de campo (rede, timeout, 5xx), mostra a mensagem geral em `root`.
 */
export function showApiError<Values extends FieldValues>(error: unknown, setError: UseFormSetError<Values>, fields: readonly Path<Values>[]) {
  if (!(error instanceof ApiError)) {
    setError('root', { message: 'Erro inesperado. Tente novamente.' })
    return
  }
  const fieldMessages = fields.flatMap((field) => {
    const message = error.fieldErrors?.[field]
    return message ? [{ field, message }] : []
  })
  fieldMessages.forEach(({ field, message }, index) => setError(field, { message }, { shouldFocus: index === 0 }))
  if (fieldMessages.length === 0) setError('root', { message: error.message })
}
