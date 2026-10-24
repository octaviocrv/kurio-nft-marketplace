import { AVATAR_MAX_BYTES, AVATAR_TYPES } from '@/api/profile'

/**
 * Lê a imagem escolhida como data URL (é assim que o avatar trafega). Valida tipo e tamanho
 * antes de ler: o limite é o mesmo do schema da API, mas aqui o erro aparece sem ida ao servidor.
 */
export function readAvatarFile(file: File): Promise<string> {
  if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return Promise.reject(new Error('Use uma imagem PNG, JPEG ou WebP'))
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return Promise.reject(new Error(`Imagem muito grande (máximo de ${AVATAR_MAX_BYTES / 1024} KB)`))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem'))
    reader.readAsDataURL(file)
  })
}
