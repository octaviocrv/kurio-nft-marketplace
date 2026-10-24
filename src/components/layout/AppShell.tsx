import type { ReactNode } from 'react'
import { TabBar } from './TabBar'

/** Casca das telas principais (início, favoritos, perfil): conteúdo + tab bar fixa embaixo (só no mobile). */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Espaço no fim para o conteúdo nunca ficar escondido atrás da tab bar */}
      <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
      <TabBar />
    </>
  )
}
