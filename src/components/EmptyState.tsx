import { Link } from '@tanstack/react-router'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action: { label: string; to: ComponentProps<typeof Link>['to'] }
}

/**
 * Estados não desenhados no Figma (vazio, não encontrado, 404), todos no mesmo padrão visual.
 * flex-1: ocupa o espaço livre do pai e centraliza o conteúdo na altura — o pai precisa ser flex-col com altura.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      {icon && <div className="flex size-16 items-center justify-center rounded-full bg-card text-muted-foreground [&_svg]:size-7">{icon}</div>}
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild>
        <Link to={action.to}>{action.label}</Link>
      </Button>
    </div>
  )
}
