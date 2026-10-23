import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'

// Rota de layout sem caminho (o "_" no nome): agrupa as telas que mostram a tab bar.
export const Route = createFileRoute('/_tabs')({
  component: TabsLayout,
})

function TabsLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
