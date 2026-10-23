import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// Placeholder do setup; a tela de Início é a tarefa 1.7
function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <h1 className="text-2xl font-bold">Kurio</h1>
    </main>
  )
}
