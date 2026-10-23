import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { setupWorker } from 'msw/browser'
import { exposeMockControls } from './control'
import { handlers } from './handlers'
import { MockPanel } from './panel/MockPanel'
import { loadScenario } from './scenarios'
import { socketHandler } from './socket/server'

const worker = setupWorker(...handlers, socketHandler)

/** Liga a API simulada: cenário, worker (REST + Socket.IO), controles para testes e o painel. */
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

  exposeMockControls()
  mountMockPanel()
}

// Raiz React separada: o painel é parte do mock, e o app não sabe que ele existe
function mountMockPanel() {
  const container = document.createElement('div')
  container.id = 'mock-panel'
  document.body.append(container)
  createRoot(container).render(createElement(MockPanel))
}
