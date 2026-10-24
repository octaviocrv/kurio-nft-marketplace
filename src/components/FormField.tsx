import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

/** Rótulo + campo, com o asterisco de obrigatório do Figma e a mensagem de erro logo abaixo. */
export function FormField({ id, label, required, error, children }: FormFieldProps) {
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
      {error && (
        <p id={`${id}-error`} role="alert" className="px-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
