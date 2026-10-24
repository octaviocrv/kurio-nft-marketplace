import { expect, test, type Page } from '@playwright/test'

// PNG de 1x1 pixel: o menor arquivo válido para exercitar o upload do avatar
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

async function login(page: Page, email: string, password = 'kurio123') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByLabel('Senha', { exact: true }).press('Enter')
}

async function openProfile(page: Page, email = 'nova@kurio.dev') {
  await login(page, email)
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/conta/perfil')
  await expect(page.getByLabel('Nome de exibição')).toBeVisible()
}

const saveProfile = (page: Page) => page.getByRole('button', { name: 'Salvar alterações' })

test('perfil valida no formulário, mostra conflitos da API e mantém as alterações após refresh', async ({ page }) => {
  await openProfile(page, 'theo@kurio.dev')

  await page.getByLabel('Nome de exibição').fill('')
  await page.getByLabel('E-mail').fill('email-invalido')
  await page.getByLabel('Nome ENS').fill('nome inválido!')
  await saveProfile(page).click()
  await expect(page.getByLabel('Nome de exibição')).toBeFocused()
  await expect(page.getByText('Informe seu nome')).toBeVisible()
  await expect(page.getByText('Informe um e-mail válido')).toBeVisible()
  await expect(page.getByText('Nome ENS inválido (ex.: nome.eth)')).toBeVisible()

  // Dados que existem na conta da Nova: o formulário aceita, a API recusa campo a campo
  await page.getByLabel('Nome de exibição').fill('Theo Martins')
  await page.getByLabel('Nome de usuário').fill('novasato')
  await page.getByLabel('E-mail').fill('nova@kurio.dev')
  await page.getByLabel('Nome ENS').fill('nova.kurio')
  await saveProfile(page).click()
  await expect(page.getByText('Este nome de usuário já está em uso')).toBeVisible()
  await expect(page.getByText('Este e-mail já está cadastrado')).toBeVisible()
  await expect(page.getByText('Este nome ENS já está em uso')).toBeVisible()

  await page.getByLabel('Nome de exibição').fill('Theo M.')
  await page.getByLabel('Nome de usuário').fill('theo.m')
  await page.getByLabel('E-mail').fill('theo.novo@kurio.dev')
  await page.getByLabel('Nome ENS').fill('theo')
  await saveProfile(page).click()
  await expect(page.getByRole('status')).toHaveText('Alterações salvas.')

  await page.reload()
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Theo M.')
  await expect(page.getByLabel('Nome de usuário')).toHaveValue('theo.m')
  await expect(page.getByLabel('E-mail')).toHaveValue('theo.novo@kurio.dev')
  await expect(page.getByLabel('Nome ENS')).toHaveValue('theo')
})

test('avatar: recusa tipo e tamanho inválidos, mostra prévia, salva, remove e a API aplica o mesmo limite', async ({ page }) => {
  await openProfile(page)
  const fileInput = page.locator('input[type="file"]')
  const avatar = page.getByRole('img', { name: /Avatar de/ })

  await fileInput.setInputFiles({ name: 'animado.gif', mimeType: 'image/gif', buffer: TINY_PNG })
  await expect(page.getByText('Use uma imagem PNG, JPEG ou WebP')).toBeVisible()
  await fileInput.setInputFiles({ name: 'grande.png', mimeType: 'image/png', buffer: Buffer.alloc(400 * 1024) })
  await expect(page.getByText('Imagem muito grande (máximo de 300 KB)')).toBeVisible()

  await fileInput.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: TINY_PNG })
  await expect(avatar).toHaveAttribute('src', /^data:image\/png;base64,/)
  await expect(page.getByText('Imagem muito grande')).toHaveCount(0)
  await saveProfile(page).click()
  await expect(page.getByRole('status')).toHaveText('Alterações salvas.')
  await page.reload()
  await expect(avatar).toHaveAttribute('src', /^data:image\/png;base64,/)

  // O limite não depende do formulário: a API recusa a mesma imagem grande demais
  const apiResult = await page.evaluate(async () => {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('kurio:session-token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Nova Sato',
        username: 'novasato',
        email: 'nova@kurio.dev',
        ensName: null,
        avatarUrl: `data:image/png;base64,${'A'.repeat(500_000)}`,
      }),
    })
    const body = (await response.json()) as { fieldErrors?: Record<string, string> }
    return { status: response.status, avatarError: body.fieldErrors?.avatarUrl }
  })
  expect(apiResult).toEqual({ status: 422, avatarError: 'Imagem muito grande (máximo de 300 KB)' })

  await page.getByRole('button', { name: 'Remover foto' }).click()
  await expect(avatar).toHaveCount(0)
  await saveProfile(page).click()
  await expect(page.getByRole('status')).toHaveText('Alterações salvas.')
  await page.reload()
  await expect(page.getByLabel('Nome de exibição')).toBeVisible()
  await expect(avatar).toHaveCount(0)
})

test('senha valida no formulário e na API, troca de verdade e não é guardada em claro', async ({ page }) => {
  await openProfile(page)
  const currentPassword = page.getByLabel('Senha atual')
  const newPassword = page.getByLabel('Nova senha', { exact: true })
  const confirmPassword = page.getByLabel('Confirmar nova senha')

  await currentPassword.fill('kurio123')
  await newPassword.fill('curta')
  await saveProfile(page).click()
  await expect(page.getByText('Use pelo menos 8 caracteres')).toBeVisible()
  await expect(page.getByText('Confirme a nova senha')).toBeVisible()

  await newPassword.fill('senha-nova-123')
  await confirmPassword.fill('senha-diferente')
  await saveProfile(page).click()
  await expect(page.getByText('As senhas precisam ser iguais')).toBeVisible()

  // Passa no formulário, mas a senha atual está errada: o erro vem da API, no campo
  await currentPassword.fill('senha-errada-1')
  await confirmPassword.fill('senha-nova-123')
  await saveProfile(page).click()
  await expect(page.getByText('Senha atual incorreta')).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('Dados do perfil salvos. A senha não foi alterada.')

  await currentPassword.fill('kurio123')
  await saveProfile(page).click()
  await expect(page.getByRole('status')).toHaveText('Alterações salvas.')
  await expect(currentPassword).toHaveValue('')
  expect(await page.evaluate(() => localStorage.getItem('kurio:mock-db'))).not.toContain('senha-nova-123')

  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  await login(page, 'nova@kurio.dev', 'kurio123')
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
  await login(page, 'nova@kurio.dev', 'senha-nova-123')
  await expect(page).toHaveURL(/\/$/)
})

test('carteira existente valida endereço e ENS, mostra conflito da API e mantém a edição após refresh', async ({ page }) => {
  await login(page, 'nova@kurio.dev')
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/conta/carteiras')
  const secondary = page.getByRole('region', { name: /carteira secundária/i })

  await secondary.getByRole('button', { name: 'Editar' }).click()
  await secondary.getByLabel('Endereço da carteira').fill('abc')
  await secondary.getByLabel('Nome ENS').fill('nome')
  await secondary.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(secondary.getByLabel('Endereço da carteira')).toBeFocused()
  await expect(secondary.getByText('Endereço de carteira inválido')).toBeVisible()
  await expect(secondary.getByText('Nome ENS inválido (ex.: nome.eth)')).toBeVisible()

  // Endereço da principal: formato válido, mas a API recusa o repetido
  await secondary.getByLabel('Endereço da carteira').fill('0xA91F5ee4cb2db86639e6721e97bd1a5ef4d5E82C')
  await secondary.getByLabel('Nome ENS').fill('')
  await secondary.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(secondary.getByText('Este endereço já está em outra carteira sua')).toBeVisible()

  await secondary.getByLabel('Apelido da carteira').fill('Reserva 2')
  await secondary.getByLabel('Endereço da carteira').fill('0x1111111111111111111111111111111111111111')
  await secondary.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(secondary.getByText('Reserva 2')).toBeVisible()
  await expect(secondary.getByText('0x1111…1111')).toBeVisible()
  await expect(page.getByText('nova.kurio.eth')).toHaveCount(0)

  await page.reload()
  await expect(secondary.getByText('Reserva 2')).toBeVisible()
  await expect(secondary.getByText('0x1111…1111')).toBeVisible()
})

test('cadastra a carteira secundária, exige rede e tipo, e ela aparece no checkout', async ({ page }) => {
  await login(page, 'theo@kurio.dev')
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/conta/carteiras')
  await page.getByRole('button', { name: /Adicionar carteira secundária/ }).click()
  const form = page.getByRole('region', { name: /nova carteira secundária/i })

  await form.getByLabel('Apelido da carteira').fill('Cofre')
  await form.getByLabel('Endereço da carteira').fill('0x2222222222222222222222222222222222222222')
  await form.getByRole('button', { name: 'Salvar carteira' }).click()
  // O placeholder do select tem o mesmo texto do erro: procura só dentro dos alertas
  await expect(form.getByRole('alert').filter({ hasText: 'Selecione uma rede' })).toBeVisible()
  await expect(form.getByRole('alert').filter({ hasText: 'Selecione o tipo de carteira' })).toBeVisible()

  await form.getByRole('combobox', { name: /Rede/ }).click()
  await page.getByRole('option', { name: 'Polygon' }).click()
  await form.getByRole('combobox', { name: /Tipo de carteira/ }).click()
  await page.getByRole('option', { name: 'Coinbase Wallet' }).click()
  await form.getByRole('button', { name: 'Salvar carteira' }).click()

  const secondary = page.getByRole('region', { name: /carteira secundária/i })
  await expect(secondary.getByText('Cofre')).toBeVisible()
  await expect(secondary.getByText('Rede Polygon')).toBeVisible()

  // Mesmo estado em outra tela: o checkout lista a carteira recém-cadastrada
  await page.goto('/nft/amber-ape-117')
  await page.getByRole('button', { name: 'Comprar NFT' }).click()
  await expect(page).toHaveURL(/\/carrinho$/)
  await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page.getByRole('radio', { name: /Cofre/ })).toBeVisible()
})
