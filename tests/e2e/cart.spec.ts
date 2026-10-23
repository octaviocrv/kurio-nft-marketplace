import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control'

async function login(page: Page, email = 'nova@kurio.dev') {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
}

async function addFromDetail(page: Page, nftId: string, quantity = 1, goToCart = true) {
  await page.goto(`/nft/${nftId}`)
  const quantityGroup = page.getByRole('group', { name: /Quantidade de/ })
  for (let current = 1; current < quantity; current += 1) {
    await quantityGroup.getByRole('button', { name: 'Aumentar quantidade' }).click()
  }
  await page.getByRole('button', { name: goToCart ? 'Comprar NFT' : 'Adicionar ao carrinho' }).click()
  if (goToCart) await expect(page).toHaveURL(/\/carrinho$/)
  else await expect(page.getByRole('status').filter({ hasText: /adicionado|adicionados/ })).toBeVisible()
}

test('adiciona pelo detalhe, altera quantidade até o estoque e remove o item', async ({ page }) => {
  await addFromDetail(page, 'ivory-baron-088')
  await expect(page).toHaveURL(/\/carrinho$/)
  await expect(page.getByRole('heading', { name: 'Ivory Baron #088' })).toBeVisible()
  await expect(page.getByText('1.806 ETH')).toBeVisible()

  const quantity = page.getByRole('group', { name: 'Quantidade de Ivory Baron #088' })
  await quantity.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(quantity.getByRole('status')).toHaveText('2')
  await expect(quantity.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
  await expect(page.getByText('3.596 ETH')).toBeVisible()

  await page.getByRole('button', { name: 'Remover Ivory Baron #088 do carrinho' }).click()
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
})

test('valida cupom inexistente e expirado, aplica válido e permite remover', async ({ page }) => {
  await addFromDetail(page, 'amber-ape-117')
  const input = page.getByLabel('Código promocional')

  await input.fill('NAOEXISTE')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByRole('alert')).toHaveText('Este cupom não existe')

  await input.fill('VERAO25')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByRole('alert')).toHaveText('Este cupom expirou')

  await page.evaluate(() => window.__kurioMock!.setScenario('error-5xx'))
  await input.fill('KURIO10')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  await expect(page.getByText('0.466 ETH')).toBeVisible()
  await page.evaluate(() => window.__kurioMock!.setScenario('default'))

  await input.fill('lancamento')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Desconto do lançamento' })).toBeVisible()
  await expect(page.getByText('0.3985 ETH')).toBeVisible()

  await page.reload()
  await expect(input).toHaveValue('LANCAMENTO')
  await expect(page.getByText('0.3985 ETH')).toBeVisible()
  await page.getByRole('button', { name: 'Remover', exact: true }).click()
  await expect(page.getByText('0.466 ETH')).toBeVisible()
})

test('carrinho visitante persiste no refresh e migra para a conta no login', async ({ page }) => {
  await addFromDetail(page, 'amber-ape-117', 1, false)
  await expect(page.getByRole('status').filter({ hasText: 'item adicionado ao carrinho' })).toHaveText('1 item adicionado ao carrinho.')
  await page.goto('/carrinho')
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()

  const guestId = await page.evaluate(() => localStorage.getItem('kurio:guest-id'))
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('kurio:guest-id'))).toBe(guestId)

  await page.goto('/login?redirect=/carrinho')
  await login(page)
  await expect(page).toHaveURL(/\/carrinho$/)
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()
})

test('merge soma item repetido e limita a quantidade ao estoque da edição', async ({ page }) => {
  await addFromDetail(page, 'ivory-baron-088')
  await page.goto('/login?redirect=/carrinho')
  await login(page)
  await expect(page.getByRole('group', { name: 'Quantidade de Ivory Baron #088' }).getByRole('status')).toHaveText('1')

  await page.goto('/conta/perfil')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  await addFromDetail(page, 'ivory-baron-088', 2, false)
  await page.goto('/login?redirect=/carrinho')
  await login(page)

  const quantity = page.getByRole('group', { name: 'Quantidade de Ivory Baron #088' })
  await expect(quantity.getByRole('status')).toHaveText('2')
  await expect(quantity.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
})

test('falha ao alterar quantidade preserva o carrinho e permite tentar novamente', async ({ page }) => {
  await addFromDetail(page, 'ivory-baron-088')
  await expect(page.getByText('1.806 ETH')).toBeVisible()
  const quantity = page.getByRole('group', { name: 'Quantidade de Ivory Baron #088' })

  await page.evaluate(() => window.__kurioMock!.setScenario('error-5xx'))
  await quantity.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  await expect(quantity.getByRole('status')).toHaveText('1')
  await expect(page.getByText('1.806 ETH')).toBeVisible()

  await page.evaluate(() => window.__kurioMock!.setScenario('default'))
  await quantity.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(quantity.getByRole('status')).toHaveText('2')
  await expect(page.getByText('3.596 ETH')).toBeVisible()
})

test('adicionar novamente a mesma edição respeita o estoque no servidor', async ({ page }) => {
  await addFromDetail(page, 'ivory-baron-088', 2, false)
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByRole('alert')).toHaveText('Só há 2 unidades disponíveis nesta edição.')

  await page.goto('/carrinho')
  const quantity = page.getByRole('group', { name: 'Quantidade de Ivory Baron #088' })
  await expect(quantity.getByRole('status')).toHaveText('2')
  await expect(page.getByText('3.596 ETH')).toBeVisible()
})

test('carrinhos autenticados ficam isolados entre usuários', async ({ page }) => {
  await addFromDetail(page, 'amber-ape-117')
  await page.goto('/login?redirect=/carrinho')
  await login(page)
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()

  await page.goto('/conta/perfil')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/login?redirect=/carrinho')
  await login(page, 'theo@kurio.dev')
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()

  await page.goto('/conta/perfil')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/login?redirect=/carrinho')
  await login(page)
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()
})

test('carregamento lento mostra skeleton do carrinho e da cotação sem valores falsos', async ({ page }) => {
  await addFromDetail(page, 'amber-ape-117')
  await expect(page.getByText('0.466 ETH')).toBeVisible()
  await page.evaluate(() => window.__kurioMock!.setScenario('slow'))
  await page.reload()

  await expect(page.getByLabel('Carregando carrinho')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByLabel('Calculando cotação')).toBeVisible()
  await expect(page.getByText('0.466 ETH')).toBeVisible({ timeout: 10_000 })
})
