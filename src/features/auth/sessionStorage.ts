const SESSION_TOKEN_KEY = 'kurio:session-token'

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveSessionToken(token: string) {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token)
  } catch {
    // A sessão segue válida em memória; ambientes sem storage só não sobrevivem ao refresh.
  }
}

export function removeSessionToken(): boolean {
  const hadToken = getSessionToken() !== null
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY)
  } catch {
    // nada a remover
  }
  return hadToken
}
