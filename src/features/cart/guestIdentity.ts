const STORAGE_KEY = 'kurio:guest-id'

/** Identidade anônima estável: o backend pode trocar sem mudar o contrato do carrinho. */
export function getGuestId(): string {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return saved

  const guestId = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, guestId)
  return guestId
}

export function cartOwnerId(userId?: string): string {
  return userId ? `user:${userId}` : `guest:${getGuestId()}`
}
