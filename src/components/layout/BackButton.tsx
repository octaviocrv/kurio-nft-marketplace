import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  /** Para onde ir quando a página foi aberta direto (link, refresh) e não há histórico. */
  fallbackTo?: string
  className?: string
}

/** Voltar das telas internas. Usado no PageHeader e ao lado do título das telas da área logada. */
export function BackButton({ fallbackTo = '/', className }: BackButtonProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  // Voltar de verdade preserva o estado da página anterior (filtros, scroll).
  // Sem histórico dentro do app, history.back() sairia do site — então vai para o fallback.
  function handleBack() {
    if (canGoBack) router.history.back()
    else navigate({ to: fallbackTo })
  }

  return (
    <Button variant="secondary" size="icon" className={cn('shrink-0 rounded-full text-muted-foreground', className)} onClick={handleBack} aria-label="Voltar">
      <ChevronLeft className="size-5" />
    </Button>
  )
}
