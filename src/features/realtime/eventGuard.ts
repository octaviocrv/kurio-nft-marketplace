const MAX_REMEMBERED_EVENTS = 500

/**
 * Decide se um evento deve ser aplicado. Recusa:
 * - duplicata: o mesmo eventId já foi processado (reenvio, reconexão);
 * - evento antigo: a versão não é maior que a última já vista daquele recurso (chegou fora de ordem).
 * Assim um estado mais recente nunca regride e o efeito do evento (aviso, refetch) não se repete.
 */
export function createEventGuard() {
  const seenEventIds = new Set<string>()
  const latestVersionByResource = new Map<string, number>()

  return function accept(event: { eventId: string; resource: string; id: string; version: number }): boolean {
    if (seenEventIds.has(event.eventId)) return false
    const resourceKey = `${event.resource}:${event.id}`
    if (event.version <= (latestVersionByResource.get(resourceKey) ?? -1)) return false

    seenEventIds.add(event.eventId)
    latestVersionByResource.set(resourceKey, event.version)
    // Memória limitada: o mais antigo sai primeiro (a versão por recurso continua barrando os velhos)
    if (seenEventIds.size > MAX_REMEMBERED_EVENTS) seenEventIds.delete(seenEventIds.values().next().value!)
    return true
  }
}
