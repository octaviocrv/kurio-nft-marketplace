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
  if (mocksEnabled) {
    // Import dinâmico: o MSW fica num chunk separado e não pesa no bundle principal
    const { startMockWorker } = await import('./mocks/browser')
    await startMockWorker()
  }

  // O app só é carregado DEPOIS do MSW, por dois motivos:
  // - as primeiras requisições escapariam do mock;
  // - o socket.io-client guarda a referência do WebSocket quando é carregado; se carregar antes,
  //   fica com o WebSocket nativo e o MSW não consegue interceptar o Socket.IO.
  const { App } = await import('./App')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
