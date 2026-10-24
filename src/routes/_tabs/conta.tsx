import { createFileRoute, Outlet } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountNav } from '@/features/account/AccountNav'
import { AccountSidebar } from '@/features/account/AccountSidebar'
import { requireSession, useLogout } from '@/features/auth/queries'
import { TABLET_UP, useMediaQuery } from '@/lib/useMediaQuery'

// Layout de /conta/*. Mobile: título, seletor perfil/carteiras e o "Sair" no fim. Tablet/desktop: menu lateral (Figma)
export const Route = createFileRoute('/_tabs/conta')({
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location.href),
  component: AccountLayout,
})

function AccountLayout() {
  const navigate = Route.useNavigate()
  const logout = useLogout()
  const isWide = useMediaQuery(TABLET_UP)

  async function handleLogout() {
    await logout.mutateAsync().catch(() => undefined)
    await navigate({ to: '/', replace: true })
  }

  if (isWide) {
    return (
      <main className="page-container grid grid-cols-[13rem_minmax(0,1fr)] items-start gap-6 pt-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-8">
        <AccountSidebar onLogout={handleLogout} isLoggingOut={logout.isPending} />
        <div className="max-w-3xl min-w-0">
          <Outlet />
        </div>
      </main>
    )
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
