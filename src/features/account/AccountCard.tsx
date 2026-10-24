import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AccountCardProps {
  title: string
  action?: ReactNode // ação à direita do título (ex.: "Editar")
  children: ReactNode
  className?: string
  /** Campos em duas colunas no desktop (como no Figma). */
  columns?: boolean
}

/** Bloco das telas de conta: card com título pequeno em maiúsculas (mesmo estilo das seções dos filtros). */
export function AccountCard({ title, action, children, className, columns = false }: AccountCardProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className={cn('flex flex-col gap-4 rounded-2xl bg-card p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {title}
        </h2>
        {action}
      </div>
      {columns ? <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-6">{children}</div> : children}
    </section>
  )
}
