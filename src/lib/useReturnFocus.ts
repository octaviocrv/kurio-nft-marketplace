import { useRef } from 'react'

/**
 * O Radix devolve o foco só ao DialogTrigger. Diálogos abertos por estado (gaveta de filtros) ou por
 * rota (login, cadastro, pedido) não têm trigger: estes handlers guardam quem tinha o foco ao abrir
 * e devolvem a ele ao fechar, se ele ainda estiver na tela.
 */
export function useReturnFocus() {
  const returnTarget = useRef<HTMLElement | null>(null)

  return {
    onOpenAutoFocus: () => {
      // Roda antes de o Radix mover o foco para dentro: o ativo ainda é quem abriu
      returnTarget.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    },
    onCloseAutoFocus: (event: Event) => {
      const target = returnTarget.current
      if (!target?.isConnected) return
      event.preventDefault()
      target.focus()
    },
  }
}
