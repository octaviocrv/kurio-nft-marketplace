import { defineConfig, devices } from '@playwright/test'

// Porta própria: não briga com o `npm run dev` (5173) que fica aberto durante a homologação
const PORT = 5174
const isCI = !!process.env.CI

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Baselines de regressão visual: só existem as geradas no Docker oficial (Linux), então o nome não leva plataforma;
  // a pasta separa mobile e desktop (visual-mobile / visual-desktop)
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}',
  expect: {
    // Animações paradas e cursor escondido; a tolerância absorve só o serrilhado do anti-aliasing
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.002 },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Trace só das falhas: é o que o enunciado pede e não pesa nas execuções que passam
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  // Os fluxos rodam nos dois viewports exigidos pelo enunciado, sempre em Chromium
  projects: [
    {
      name: 'mobile',
      testIgnore: /visual\.spec\.ts/,
      use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    },
    {
      name: 'desktop',
      testIgnore: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    // Regressão visual: projetos à parte, só rodam no Docker (`npm run test:visual`), nos dois viewports
    {
      name: 'visual-mobile',
      testMatch: /visual\.spec\.ts/,
      // reducedMotion: nada se move sozinho na captura (o hero do Início troca de slide a cada 6 s)
      use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' },
    },
    {
      name: 'visual-desktop',
      testMatch: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
  },
})
