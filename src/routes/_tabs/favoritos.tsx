import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'

export const Route = createFileRoute('/_tabs/favoritos')({
  component: FavoritesPage,
})

// TEMPORÁRIO (tarefa 1.6): só o cabeçalho, para a navegação funcionar. Conteúdo na 1.7.
function FavoritesPage() {
  return <PageHeader title="Favoritos" />
}
