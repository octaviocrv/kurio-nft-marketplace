import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountNav } from '@/features/account/AccountNav'

// Layout de /conta/*: título, seletor perfil/carteiras e o "Sair" no fim
export const Route = createFileRoute('/_tabs/conta')({
  component: AccountLayout,
})

function AccountLayout() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pt-8">
      <h1 className="text-xl font-bold">Meu perfil</h1>
      <AccountNav />
      <Outlet />
      {/* Fase 1: só volta ao início. Na fase 2: logout real (limpa cache e desconecta o socket). */}
      <Button variant="outline" size="lg" asChild className="rounded-xl border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive">
        <Link to="/">
          <LogOut className="size-5" /> Sair da conta
        </Link>
      </Button>
    </main>
  )
}
