/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "false" desliga o MSW. Qualquer outro valor (ou ausente) mantém os mocks ligados. */
  readonly VITE_ENABLE_MOCKS?: string
}
