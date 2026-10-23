import { createFileRoute, Outlet } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountNav } from '@/features/account/AccountNav'
import { requireSession, useLogout } from '@/features/auth/queries'

// Layout de /conta/*: título, seletor perfil/carteiras e o "Sair" no fim
export const Route = createFileRoute('/_tabs/conta')({
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location.href),
  component: AccountLayout,
})

function AccountLayout() {
  const navigate = Route.useNavigate()
  const logout = useLogout()

  async function handleLogout() {
    await logout.mutateAsync().catch(() => undefined)
    await navigate({ to: '/', replace: true })
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pt-8">
      <h1 className="text-xl font-bold">Meu perfil</h1>
      <AccountNav />
      <Outlet />
      <Button
        variant="outline"
        size="lg"
        className="rounded-xl border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        <LogOut className="size-5" /> {logout.isPending ? 'Saindo...' : 'Sair da conta'}
      </Button>
    </main>
  )
}
