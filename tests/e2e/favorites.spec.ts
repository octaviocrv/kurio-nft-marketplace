import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control'

async function login(page: Page, email = 'nova@kurio.dev') {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
}

function favoriteButton(page: Page, nftName: string) {
  return page.getByRole('button', { name: new RegExp(`(Favoritar|Remover) ${nftName}`) })
}

test('favoritar exige login, sincroniza catálogo/detalhe/lista e persiste após refresh', async ({ page }) => {
  await page.goto('/')
  await favoriteButton(page, 'Amber Ape #117').click()

  await expect(page).toHaveURL(/\/login/)
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/')
  await login(page)
  await expect(page).toHaveURL(/\/$/)

  const button = favoriteButton(page, 'Amber Ape #117')
  await expect(button).toHaveAttribute('aria-pressed', 'false')
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('heading', { name: 'Amber Ape #117' }).click()
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()

  await page.goto('/favoritos')
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()
})

test('falha da mutation desfaz a atualização otimista, avisa e permite tentar novamente', async ({ page }) => {
  await page.goto('/login?redirect=/')
  await login(page)
  const button = favoriteButton(page, 'Amber Ape #117')

  await page.evaluate(() => window.__kurioMock!.setScenario('favorite-error'))
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')

  await expect(page.getByRole('alert')).toHaveText('Não foi possível atualizar seus favoritos. Tente novamente.')
  await expect(button).toHaveAttribute('aria-pressed', 'false')

  await page.evaluate(() => window.__kurioMock!.setScenario('default'))
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('favoritos são isolados entre Nova e Theo após logout', async ({ page }) => {
  await page.goto('/login?redirect=/favoritos')
  await login(page)
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(5)

  await page.goto('/conta/perfil')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/favoritos')
  await login(page, 'theo@kurio.dev')

  await expect(page).toHaveURL(/\/favoritos$/)
  await expect(page.getByRole('heading', { name: 'Nenhum favorito ainda' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0)
})
