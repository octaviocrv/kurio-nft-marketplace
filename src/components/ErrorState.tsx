import { CloudOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  description: string
  onRetry: () => void
  isRetrying?: boolean
}

/** Falha ao carregar (rede, 5xx): mesmo padrão visual do EmptyState, com "tentar de novo". */
export function ErrorState({ title, description, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    // role="alert": a falha é anunciada pelo leitor de tela assim que aparece
    <div role="alert" className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-card text-destructive [&_svg]:size-7">
        <CloudOff />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Tentando…' : 'Tentar de novo'}
      </Button>
    </div>
  )
}
