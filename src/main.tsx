import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonte local (sem Google Fonts): só os 3 pesos do Figma e só o subset latin, que cobre o português
import '@fontsource/roboto-mono/latin-400.css'
import '@fontsource/roboto-mono/latin-500.css'
import '@fontsource/roboto-mono/latin-700.css'
import './index.css'

// Mocks ligados por padrão: a entrega não tem backend real, então o build de demonstração também usa o MSW.
// VITE_ENABLE_MOCKS=false desliga (o app passa a chamar um /api de verdade).
const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS !== 'false'

async function bootstrap() {
  // O bundle da interface pode ser baixado e avaliado enquanto o service worker inicia. O cliente
  // Socket.IO continua separado e só é inicializado depois da interceptação estar pronta.
  const appPromise = import('./App')

  let finishMockSetup: (() => void) | undefined
  if (mocksEnabled) {
    // Import dinâmico: o MSW fica num chunk separado e não pesa no bundle principal.
    const mockEnvironment = await import('./mocks/browser')
    const { startMockWorker } = mockEnvironment
    finishMockSetup = mockEnvironment.finishMockSetup
    await startMockWorker()
  }

  const [{ App }, { initializeSocket }] = await Promise.all([appPromise, import('./api/socket')])
  await initializeSocket()
  finishMockSetup?.()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
