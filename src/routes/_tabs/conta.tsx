import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountNav } from '@/features/account/AccountNav'

// Layout de /conta/*: título, navegação entre perfil e carteiras e o "Sair" no fim
export const Route = createFileRoute('/_tabs/conta')({
  component: AccountLayout,
})

function AccountLayout() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pt-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">Meu perfil</h1>
        <AccountNav />
      </div>
      <Outlet />
      {/* Fase 1: só volta ao início. Na fase 2: logout real (limpa cache e desconecta o socket). */}
      <Button variant="ghost" asChild className="self-start text-highlight">
        <Link to="/">
          <LogOut className="size-5" /> Sair
        </Link>
      </Button>
    </main>
  )
}
