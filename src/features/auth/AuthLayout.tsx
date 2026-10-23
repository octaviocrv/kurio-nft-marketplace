import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  children: ReactNode
  footer: ReactNode
}

/** Moldura comum de login e cadastro no mobile (tela cheia). No desktop vira modal (fase 3). */
export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-7 pt-20 pb-10">
      <p aria-hidden className="py-12 text-center text-4xl font-bold tracking-[0.1em]">
        KURIO
      </p>
      <h1 className="mb-10 text-center text-xl font-bold">{title}</h1>
      {children}
      <div className="mt-10 text-center text-sm text-muted-foreground">{footer}</div>
    </main>
  )
}
