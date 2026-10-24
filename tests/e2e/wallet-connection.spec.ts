import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control'

async function login(page: Page, email = 'nova@kurio.dev') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/\/$/)
}

async function openPayment(page: Page) {
  await login(page)
  await page.goto('/nft/amber-ape-117')
  await page.getByRole('button', { name: 'Comprar NFT' }).click()
  await expect(page).toHaveURL(/\/carrinho$/)
  await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page).toHaveURL(/\/checkout$/)
}

// " conectada" com espaço antes: "X desconectada" não casa
const connectedStatus = (page: Page) => page.getByRole('status').filter({ hasText: / conectada$/ })
const disconnectedStatus = (page: Page) => page.getByRole('status').filter({ hasText: / desconectada$/ })

test('carteira principal já chega conectada e dá para desconectar', async ({ page }) => {
  await openPayment(page)
  await expect(page.getByRole('heading', { name: 'Carteira conectada' })).toBeVisible()
  await expect(connectedStatus(page)).toBeVisible()

  await page.getByRole('button', { name: 'Desconectar' }).click()
  await expect(disconnectedStatus(page)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Conecte sua carteira' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible()
})

test('sem carteira conectada não revisa: explica, foca o botão e libera depois de conectar', async ({ page }) => {
  await openPayment(page)
  await page.getByRole('button', { name: 'Desconectar' }).click()
  await expect(disconnectedStatus(page)).toBeVisible()

  await page.getByRole('button', { name: 'Revisar pedido' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Conecte a carteira para revisar o pedido.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeFocused()
  await expect(page).toHaveURL(/\/checkout$/)

  // A conexão passa por "Conectando…" antes de concluir
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Conectando…' })).toBeVisible()
  await expect(connectedStatus(page)).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: 'Conecte a carteira' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Revisar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Revisão do pedido' })).toBeVisible()
})

test('carteira que recusa a conexão mostra o motivo, continua desconectada e funciona no retry', async ({ page }) => {
  await openPayment(page)
  await page.getByRole('button', { name: 'Desconectar' }).click()
  await expect(disconnectedStatus(page)).toBeVisible()

  await page.evaluate(() => window.__kurioMock!.setScenario('wallet-rejected'))
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'A carteira recusou a conexão. Tente novamente.' })).toBeVisible()
  await expect(disconnectedStatus(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeEnabled()

  await page.evaluate(() => window.__kurioMock!.setScenario('default'))
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(connectedStatus(page)).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: 'recusou' })).toHaveCount(0)
})

test('o estado da conexão sobrevive ao refresh', async ({ page }) => {
  await openPayment(page)
  await page.getByRole('button', { name: 'Desconectar' }).click()
  await expect(disconnectedStatus(page)).toBeVisible()

  await page.reload()
  await expect(disconnectedStatus(page)).toBeVisible()
})

test('a API também exige carteira conectada: pedido sem conexão volta 409 e não cria nada', async ({ page }) => {
  await openPayment(page)
  await page.getByRole('button', { name: 'Desconectar' }).click()
  await expect(disconnectedStatus(page)).toBeVisible()

  // Atalho pela URL pula a trava da tela: quem barra é o servidor
  await page.goto('/checkout?etapa=revisao')
  await expect(page.getByRole('heading', { name: 'Revisão do pedido' })).toBeVisible()
  const response = page.waitForResponse((item) => item.url().endsWith('/api/orders') && item.request().method() === 'POST')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  expect((await response).status()).toBe(409)
  await expect(page.getByRole('alert').filter({ hasText: 'Conecte a carteira para finalizar a compra.' })).toBeVisible()

  const orders = await page.evaluate(() => {
    const database = JSON.parse(localStorage.getItem('kurio:mock-db')!) as { ordersById: Record<string, unknown> }
    return Object.keys(database.ordersById).length
  })
  expect(orders).toBe(0)
})
