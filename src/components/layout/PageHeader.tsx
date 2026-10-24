import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title?: string
  /** Para onde voltar quando a página foi aberta direto (link, refresh) e não há histórico. */
  fallbackTo?: string
  /** Ação à direita (ex.: favoritar no detalhe do NFT). */
  action?: ReactNode
}

export function PageHeader({ title, fallbackTo = '/', action }: PageHeaderProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  // Voltar de verdade preserva o estado da página anterior (filtros, scroll).
  // Sem histórico dentro do app, history.back() sairia do site — então vai para o fallback.
  function handleBack() {
    if (canGoBack) router.history.back()
    else navigate({ to: fallbackTo })
  }

  // A partir do tablet a navegação é o header do site: o botão voltar some, o título fica
  return (
    <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 px-6 pt-6 pb-4">
      <Button variant="secondary" size="icon" className="rounded-full text-muted-foreground md:invisible" onClick={handleBack} aria-label="Voltar">
        <ChevronLeft className="size-5" />
      </Button>
      {title && <h1 className="truncate text-center text-lg font-bold">{title}</h1>}
      {action && <div className="col-start-3">{action}</div>}
    </header>
  )
}
