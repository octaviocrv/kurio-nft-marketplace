import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control'

async function login(page: Page, email = 'nova@kurio.dev', password = 'kurio123') {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByLabel('Senha', { exact: true }).press('Enter')
}

test('rota privada leva ao login e retorna ao checkout completo após autenticar e recarregar', async ({ page }) => {
  await page.goto('/checkout?etapa=revisao')

  await expect(page).toHaveURL(/\/login/)
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/checkout?etapa=revisao')

  await login(page)
  await expect(page).toHaveURL(/\/checkout\?etapa=revisao$/)
  await expect(page.getByRole('heading', { name: 'Revisão do pedido' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Revisão do pedido' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('kurio:session-token'))).toMatch(/^session-/)
})

test('cadastro valida no formulário, mostra conflitos da API e cria sessão sem guardar senha em claro', async ({ page }) => {
  await page.goto('/cadastro?redirect=/conta/perfil')
  await page.getByRole('button', { name: 'Criar perfil' }).click()

  await expect(page.getByLabel('Nome de usuário')).toBeFocused()
  await expect(page.getByText('Use pelo menos 3 caracteres')).toBeVisible()
  await expect(page.getByText('Informe um e-mail válido')).toBeVisible()

  await page.getByLabel('Nome de usuário').fill('novasato')
  await page.getByLabel('E-mail').fill('nova@kurio.dev')
  await page.getByLabel('Senha', { exact: true }).fill('nova-senha-123')
  await page.getByLabel('Confirmar senha').fill('nova-senha-123')
  await page.getByRole('button', { name: 'Criar perfil' }).click()

  await expect(page.getByText('Este nome de usuário já está em uso')).toBeVisible()
  await expect(page.getByText('Este e-mail já está cadastrado')).toBeVisible()

  await page.getByLabel('Nome de usuário').fill('colecionador-teste')
  await page.getByLabel('E-mail').fill('colecionador@kurio.dev')
  await page.getByRole('button', { name: 'Criar perfil' }).click()

  await expect(page).toHaveURL(/\/conta\/perfil$/)
  await expect(page.getByText('colecionador-teste', { exact: true }).first()).toBeVisible()
  const savedDatabase = await page.evaluate(() => localStorage.getItem('kurio:mock-db'))
  expect(savedDatabase).not.toContain('nova-senha-123')
})

test('login funciona por teclado, foca o primeiro erro e trata credenciais inválidas', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByLabel('E-mail')).toBeFocused()
  await expect(page.getByText('Informe um e-mail válido')).toBeVisible()
  await expect(page.getByText('Informe sua senha')).toBeVisible()

  await login(page, 'nova@kurio.dev', 'senha-incorreta')
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')

  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Kurio — marketplace de NFTs' })).toBeAttached()
})

test('sessão expirada no checkout preserva o contexto e permite retomar após novo login', async ({ page }) => {
  await page.goto('/login?redirect=/checkout?etapa=revisao')
  await login(page)
  await expect(page).toHaveURL(/\/checkout\?etapa=revisao$/)

  await page.evaluate(() => window.__kurioMock!.setScenario('session-expired'))
  await page.reload()

  await expect(page).toHaveURL(/\/login/)
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/checkout?etapa=revisao')
  expect(await page.evaluate(() => localStorage.getItem('kurio:session-token'))).toBeNull()

  await page.evaluate(() => window.__kurioMock!.setScenario('default'))
  await login(page)
  await expect(page).toHaveURL(/\/checkout\?etapa=revisao$/)
})

test('logout invalida o token, desconecta o socket e a troca de usuário não reaproveita a sessão anterior', async ({ page }) => {
  await page.goto('/login?redirect=/conta/perfil')
  await login(page)
  await expect(page.getByText('Nova Sato', { exact: true })).toBeVisible()
  const oldToken = await page.evaluate(() => localStorage.getItem('kurio:session-token'))

  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  expect(await page.evaluate(() => localStorage.getItem('kurio:session-token'))).toBeNull()
  expect(
    await page.evaluate(async () => {
      const modulePath = '/src/api/socket.ts'
      const { socket } = (await import(/* @vite-ignore */ modulePath)) as typeof import('@/api/socket')
      return socket.connected
    }),
  ).toBe(false)

  const oldSessionStatus = await page.evaluate(
    async (token) => (await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } })).status,
    oldToken,
  )
  expect(oldSessionStatus).toBe(401)

  await page.goto('/conta/perfil')
  await expect(page).toHaveURL(/\/login/)
  await login(page, 'theo@kurio.dev')
  await expect(page.getByText('Theo Martins', { exact: true })).toBeVisible()
  await expect(page.getByText('Nova Sato', { exact: true })).toHaveCount(0)
})
