/** Atributos que ligam o campo à mensagem de erro do FormField (leitor de tela e estilo de inválido). */
export function fieldA11y(id: string, error?: string) {
  return error ? ({ 'aria-invalid': true, 'aria-describedby': `${id}-error` } as const) : {}
}
