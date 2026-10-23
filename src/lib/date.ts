const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

/** "2026-10-23T14:30:00Z" → "23 de out. de 2026" */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate))
}
