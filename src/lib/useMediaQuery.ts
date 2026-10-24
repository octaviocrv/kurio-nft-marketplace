import { useSyncExternalStore } from 'react'

/** A partir do tablet (768 px) as telas trocam a estrutura (tabela, colunas), não só o tamanho. */
export const TABLET_UP = '(min-width: 768px)'

/**
 * Para quando mobile e desktop precisam de marcação diferente (cards × tabela). Renderizar só um dos
 * layouts evita controles e textos duplicados escondidos por CSS. Regra de negócio continua no hook da feature.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mediaList = window.matchMedia(query)
      mediaList.addEventListener('change', onChange)
      return () => mediaList.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
