import { expect, test, type Page } from '@playwright/test'

// Regressão visual das telas principais no mobile. Dados estáveis: cada teste abre um contexto novo
// (banco do mock semeado com as fixtures, cenário padrão) e a captura só acontece depois de fontes e
// imagens carregadas e das consultas resolvidas (nada de skeleton na imagem).
// Roda só no Docker oficial do Playwright: `npm run test:visual` (baselines em tests/e2e/__screenshots__).

async function waitUntilSettled(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0))
  await expect(page.getByLabel(/Atualizando valores|Carregando/)).toHaveCount(0)
}

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('nova@kurio.dev')
  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/\/$/)
}

async function addAmberApeToCart(page: Page) {
  await page.goto('/nft/amber-ape-117')
  await page.getByRole('button', { name: 'Comprar NFT' }).click()
  await expect(page).toHaveURL(/\/carrinho$/)
}

test('início', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Amber Ape/ }).first()).toBeVisible()
  await waitUntilSettled(page)
  await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
})

test('detalhe do NFT', async ({ page }) => {
  await page.goto('/nft/amber-ape-117')
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()
  await waitUntilSettled(page)
  await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })
})

test('carrinho', async ({ page }) => {
  await login(page)
  await addAmberApeToCart(page)
  await expect(page.getByRole('button', { name: 'Conectar e finalizar' })).toBeEnabled()
  await waitUntilSettled(page)
  await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })
})

test('pagamento', async ({ page }) => {
  await login(page)
  await addAmberApeToCart(page)
  await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('heading', { name: 'Carteira conectada' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Revisar pedido' })).toBeEnabled()
  await waitUntilSettled(page)
  await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
})
