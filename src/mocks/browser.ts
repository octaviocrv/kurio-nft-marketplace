import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

const worker = setupWorker(...handlers)

/** Liga o MSW no navegador. Só intercepta /api: imagens, fontes e o próprio Vite seguem para a rede. */
export async function startMockWorker() {
  await worker.start({
    quiet: true,
    onUnhandledRequest(request, print) {
      // Chamada para /api sem handler é bug (contrato esquecido): avisa no console
      if (new URL(request.url).pathname.startsWith('/api/')) print.warning()
    },
  })
}
