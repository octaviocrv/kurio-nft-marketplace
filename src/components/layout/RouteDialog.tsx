import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface RouteDialogProps {
  title: string
  /** Título só para leitor de tela, quando o conteúdo já mostra o próprio cabeçalho. */
  hideTitle?: boolean
  description?: string
  /** Conteúdo acima da descrição (ex.: alternância Entrar | Criar conta). */
  header?: ReactNode
  onClose: () => void
  children: ReactNode
  className?: string
}

/**
 * Tela que é uma rota de verdade (refresh e link direto funcionam), mas aparece como modal no
 * tablet/desktop, como no Figma (login, cadastro, confirmação do pedido). O Radix prende o foco,
 * fecha com Esc e devolve o foco ao que estava focado antes; fechar = sair da rota (onClose).
 */
export function RouteDialog({ title, hideTitle, description, header, onClose, children, className }: RouteDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        // Conteúdo alto (recibo, cadastro) rola dentro do modal em vez de sair da tela
        className={cn('max-h-[calc(100dvh-2rem)] overflow-y-auto border-0 border-b-8 border-b-primary p-8 sm:max-w-[31.25rem]', className)}
        {...(!description && { 'aria-describedby': undefined })}
      >
        <DialogTitle className={cn(hideTitle && 'sr-only')}>{title}</DialogTitle>
        {header}
        {description && <DialogDescription className="text-center">{description}</DialogDescription>}
        {children}
      </DialogContent>
    </Dialog>
  )
}
