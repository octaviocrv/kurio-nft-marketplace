import { expect, test, type Page } from '@playwright/test'

/*
 * Grupo 11 do enunciado (a parte de teclado e foco; a validação de formulários está em auth/account):
 * Tab com foco sempre visível, "pular para o conteúdo", foco preso e devolvido em diálogos e gavetas,
 * e nenhuma tela com rolagem horizontal nas larguras mínimas do enunciado.
 */

const isDesktop = (projectName: string) => projectName === 'desktop'

/** O elemento focado tem indicação visível: contorno ou anel (box-shadow) que não seja "nenhum". */
async function activeElementHasVisibleFocus(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement
    if (!element || element === document.body) return false
    const style = getComputedStyle(element)
    const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
    const hasRing = style.boxShadow !== 'none'
    return hasOutline || hasRing
  })
}

/** Aperta Tab algumas vezes e confere se o foco nunca saiu do diálogo. */
async function expectFocusTrappedIn(page: Page, presses = 12) {
  const dialog = page.getByRole('dialog')
  for (let press = 0; press < presses; press += 1) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
  }
}

test('Tab começa pelo "pular para o conteúdo" e todo elemento focado tem foco visível', async ({ page }) => {
  await page.goto('/')
  // Espera o app pronto pelo mesmo sinal de mocks.spec.ts (MSW e Socket.IO iniciados), não por um card do
  // catálogo: o teste é de teclado/foco, e o carregamento de dados tem cobertura própria em catalog.spec.ts.
  // Sem isso, a primeira visita ao servidor de desenvolvimento ainda frio passa dos 5 s padrão do expect.
  await page.waitForFunction(() => '__kurioMock' in window)
  await expect(page.getByRole('heading', { level: 1, name: /marketplace de nfts/i })).toBeAttached()

  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()

  await page.keyboard.press('Enter')
  await expect(page.locator('#conteudo')).toBeFocused()

  // Daqui em diante, cada parada do Tab precisa mostrar onde o foco está
  for (let press = 0; press < 20; press += 1) {
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 120))
    expect(await activeElementHasVisibleFocus(page), `sem foco visível em: ${focused}`).toBe(true)
  }
})

test('busca do header: foco vai para o campo, fica preso no diálogo e volta para a lupa', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo.project.name), 'a lupa do header só existe a partir do tablet')
  await page.goto('/')

  const searchButton = page.getByRole('button', { name: 'Buscar NFTs' })
  await searchButton.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('searchbox', { name: 'Buscar NFTs' })).toBeFocused()
  await expectFocusTrappedIn(page)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(searchButton).toBeFocused()
})

test('modal de login: abre pelo teclado, prende o foco e devolve ao "Entrar" ao fechar', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo.project.name), 'no mobile o login é tela cheia, não diálogo')
  await page.goto('/')

  const loginLink = page.getByRole('link', { name: 'Entrar' })
  await loginLink.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeFocused()
  await expectFocusTrappedIn(page)

  // Fechar volta para a página de origem e devolve o foco a quem abriu
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(loginLink).toBeFocused()
})

test('gaveta de filtros: foco preso enquanto aberta e devolvido ao botão que abriu', async ({ page }, testInfo) => {
  test.skip(isDesktop(testInfo.project.name), 'no desktop os filtros ficam na sidebar, sem gaveta')
  await page.goto('/')

  const filtersButton = page.getByRole('button', { name: /Abrir filtros/ })
  await filtersButton.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Filtros' })).toBeVisible()
  await expectFocusTrappedIn(page)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(filtersButton).toBeFocused()
})

test('painel de cenários: foco preso no diálogo e devolvido ao botão do painel', async ({ page }) => {
  await page.goto('/')

  const panelButton = page.getByRole('button', { name: /Simulação da API/ })
  await panelButton.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Simulação da API' })).toBeVisible()
  await expectFocusTrappedIn(page)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(panelButton).toBeFocused()
})

// 390, 768 e 1440 são as larguras do enunciado; 320 equivale a 1280 px com zoom de 400% (reflow da WCAG)
const widths = [320, 390, 768, 1440]
const publicRoutes = ['/', '/nft/emerald-ape-042', '/carrinho', '/login', '/cadastro', '/rota-que-nao-existe']

test('nenhuma tela pública tem rolagem horizontal em 320, 390, 768 e 1440 px', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo.project.name), 'as larguras são trocadas dentro do teste; basta um projeto')
  test.setTimeout(120_000)
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of publicRoutes) {
      await page.goto(route)
      // Na primeira visita o service worker pode assumir o controle da página. Mede somente
      // depois que o ambiente de mocks concluiu o bootstrap, evitando avaliar durante essa navegação.
      await page.waitForFunction(() => '__kurioMock' in window)
      // Espera o conteúdo real (não o skeleton) para medir a largura final da página
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
      await page.waitForTimeout(300)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `${route} em ${width}px`).toBeLessThanOrEqual(0)
    }
  }
})

const privateRoutes = ['/carrinho', '/checkout', '/checkout?etapa=revisao', '/conta/perfil', '/conta/carteiras', '/favoritos']

test('nenhuma tela privada tem rolagem horizontal em 320, 390, 768 e 1440 px', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo.project.name), 'as larguras são trocadas dentro do teste; basta um projeto')
  test.setTimeout(120_000)
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('nova@kurio.dev')
  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
  await expect(page).not.toHaveURL(/\/login/)
  // Um item no carrinho, para pagamento e revisão terem conteúdo de verdade
  await page.goto('/nft/ivory-baron-088')
  await page.getByRole('button', { name: 'Comprar NFT' }).click()
  await expect(page).toHaveURL(/\/carrinho$/)

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of privateRoutes) {
      await page.goto(route)
      await page.waitForFunction(() => '__kurioMock' in window)
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
      await page.waitForTimeout(300)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `${route} em ${width}px`).toBeLessThanOrEqual(0)
    }
  }
})
