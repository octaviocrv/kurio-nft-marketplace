/**
 * Toda chave que o app e os mocks guardam no localStorage começa com "kurio:".
 * É isso que permite o reset apagar tudo de uma vez sem conhecer cada chave.
 */
export const STORAGE_PREFIX = 'kurio:'

export function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null // JSON corrompido ou storage bloqueado: trata como vazio
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage cheio ou bloqueado (aba anônima restrita): o mock segue só em memória
  }
}

export function clearAllStorage() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // nada a limpar
  }
}
