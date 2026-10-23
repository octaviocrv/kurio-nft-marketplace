import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  children: ReactNode
}

/** Rótulo + campo, com o asterisco de obrigatório do Figma. Mensagens de erro entram aqui na fase 2. */
export function FormField({ id, label, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
        {required && <span className="sr-only">(obrigatório)</span>}
      </Label>
      {children}
    </div>
  )
}
