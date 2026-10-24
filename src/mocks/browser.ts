import { setupWorker } from 'msw/browser'
import { exposeMockControls } from './control'
import { handlers } from './handlers'
import { loadScenario } from './scenarios'
import { socketHandler } from './socket/server'

const worker = setupWorker(...handlers, socketHandler)

/** Liga a API simulada: cenário e worker (REST + Socket.IO). */
export async function startMockWorker() {
  loadScenario()

  await worker.start({
    quiet: true,
    onUnhandledRequest(request, print) {
      // Chamada para /api sem handler é bug (contrato esquecido): avisa no console.
      // Imagens, fontes e o próprio Vite seguem para a rede.
      if (new URL(request.url).pathname.startsWith('/api/')) print.warning()
    },
  })

}

/** Expõe ferramentas somente quando worker e cliente Socket.IO já estão prontos. */
export function finishMockSetup() {
  exposeMockControls()
  // O painel é uma ferramenta auxiliar, não parte da renderização crítica. Carregá-lo depois
  // libera o navegador para exibir a rota e seus dados primeiro, sem remover o controle dos mocks.
  scheduleMockPanel()
}

// Raiz React separada: o painel é parte do mock, e o app não sabe que ele existe
function scheduleMockPanel() {
  const schedule = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 0))
  schedule(() => void mountMockPanel(), { timeout: 1_500 })
}

async function mountMockPanel() {
  const [{ createElement }, { createRoot }, { MockPanel }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('./panel/MockPanel'),
  ])
  const container = document.createElement('div')
  container.id = 'mock-panel'
  document.body.append(container)
  createRoot(container).render(createElement(MockPanel))
}
