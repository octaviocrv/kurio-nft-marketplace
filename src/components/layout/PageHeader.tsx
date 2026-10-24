import type { ReactNode } from 'react'
import { BackButton } from './BackButton'

interface PageHeaderProps {
  title?: string
  /** Para onde voltar quando a página foi aberta direto (link, refresh) e não há histórico. */
  fallbackTo?: string
  /** Ação à direita (ex.: favoritar no detalhe do NFT). */
  action?: ReactNode
}

export function PageHeader({ title, fallbackTo = '/', action }: PageHeaderProps) {
  // A partir do tablet a navegação é o header do site: o botão voltar some, o título fica
  return (
    <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 px-6 pt-6 pb-4">
      <BackButton fallbackTo={fallbackTo} className="md:invisible" />
      {title && <h1 className="truncate text-center text-lg font-bold">{title}</h1>}
      {action && <div className="col-start-3">{action}</div>}
    </header>
  )
}
