import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control' // traz o tipo de window.__kurioMock
import { flakyLatency } from '../../src/mocks/flakyLatency'

/*
 * Catálogo e detalhe contra a API simulada (handlers REST do MSW).
 * Os nomes esperados vêm do seed (src/mocks/fixtures/nfts.ts), 12 NFTs por página.
 */

function resultNames(page: Page) {
  return page.getByRole('region', { name: 'Resultados' }).getByRole('heading', { level: 3 })
}

// Desktop (1440) busca pela lupa do header e filtra pela sidebar; mobile usa a barra de busca e a gaveta
function isDesktop(page: Page) {
  return (page.viewportSize()?.width ?? 0) >= 1024
}

async function search(page: Page, term: string) {
  if (isDesktop(page)) await page.getByRole('button', { name: 'Buscar NFTs' }).click()
  await page.getByRole('searchbox', { name: 'Buscar NFTs' }).fill(term)
  await page.getByRole('searchbox', { name: 'Buscar NFTs' }).press('Enter')
}

async function applyFilters(page: Page, choose: () => Promise<void>) {
  if (!isDesktop(page)) await page.getByRole('button', { name: /Abrir filtros/ }).click()
  await choose()
  await page.getByRole('button', { name: 'Aplicar filtros' }).click()
}

// No desktop o "Ordenar por" fica acima do grid e aplica na hora; no mobile está dentro da gaveta
async function sortBy(page: Page, label: string) {
  const choose = async () => {
    await page.getByRole('combobox', { name: 'Ordenar por' }).click()
    await page.getByRole('option', { name: label }).click()
  }
  if (isDesktop(page)) await choose()
  else await applyFilters(page, choose)
}

async function expectSearchTerm(page: Page, term: string) {
  if (isDesktop(page)) {
    if (term) await expect(page.getByText(`Resultados para “${term}”`)).toBeVisible()
    else await expect(page.getByText(/Resultados para/)).toBeHidden()
  } else {
    await expect(page.getByRole('searchbox', { name: 'Buscar NFTs' })).toHaveValue(term)
  }
}

test('busca, filtros combinados, ordenação e paginação compõem a URL e o histórico restaura cada passo', async ({ page }) => {
  await page.goto('/')
  await expect(resultNames(page)).toHaveCount(12)

  await page.getByRole('link', { name: 'Página 2' }).click()
  await expect(page).toHaveURL(/pagina=2/)
  await expect(resultNames(page).first()).toHaveText('Cosmic Bloom #118')

  // Nova busca volta para a página 1
  await search(page, 'ape')
  await expect(page).toHaveURL(/busca=ape/)
  await expect(page).not.toHaveURL(/pagina=/)
  await expect(resultNames(page)).toHaveCount(10)

  // Filtros combinados: busca E rede E categoria
  await applyFilters(page, async () => {
    await page.getByRole('button', { name: 'Ethereum' }).click()
    await page.getByRole('button', { name: 'Arte digital' }).click()
  })
  await expect(page).toHaveURL(/rede=ethereum&categoria=arte-digital|categoria=arte-digital.*rede=ethereum/)
  await expect(resultNames(page)).toHaveText(['Emerald Ape #042', 'Onyx Ape #518', 'Opal Ape #956'])
  if (isDesktop(page)) {
    await expect(page.getByRole('button', { name: 'Ethereum' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Arte digital' })).toHaveAttribute('aria-pressed', 'true')
  } else {
    await expect(page.getByRole('button', { name: 'Abrir filtros (2 ativos)' })).toBeVisible()
  }

  await sortBy(page, 'Maior preço')
  await expect(page).toHaveURL(/ordem=maior-preco/)
  await expect(resultNames(page)).toHaveText(['Opal Ape #956', 'Onyx Ape #518', 'Emerald Ape #042'])

  // Refresh mantém tudo (o estado está na URL)
  await page.reload()
  await expect(resultNames(page)).toHaveText(['Opal Ape #956', 'Onyx Ape #518', 'Emerald Ape #042'])

  // Voltar desfaz um passo por vez
  await page.goBack()
  await expect(resultNames(page)).toHaveText(['Emerald Ape #042', 'Onyx Ape #518', 'Opal Ape #956'])
  await page.goBack()
  await expect(resultNames(page)).toHaveCount(10)
  await expectSearchTerm(page, 'ape')
  await page.goBack()
  await expect(page).toHaveURL(/pagina=2/)
  await expect(resultNames(page).first()).toHaveText('Cosmic Bloom #118')
  await expectSearchTerm(page, '')
})

test('faixa de preço (slider por teclado) filtra pela API e voltar aos limites tira o filtro da URL', async ({ page }) => {
  await page.goto('/')
  const minThumb = page.getByRole('slider', { name: 'Preço mínimo' })

  // PageUp = +10 passos de 0,01 ETH: 40 vezes sobem o mínimo de 0,02 para 4,02
  await applyFilters(page, async () => {
    await expect(page.getByText('Preço: 0,02 - 12,30 ETH').filter({ visible: true })).toBeVisible()
    for (let press = 0; press < 40; press += 1) await minThumb.press('PageUp')
    await expect(page.getByText('Preço: 4,02 - 12,30 ETH').filter({ visible: true })).toBeVisible()
  })
  await expect(page).toHaveURL(/min=4\.02(&|$)/)
  await expect(page).not.toHaveURL(/max=/) // ponta máxima no limite = sem filtro
  await expect(resultNames(page)).toHaveCount(3)
  expect((await resultNames(page).allTextContents()).sort()).toEqual(['Obsidian Vessel #682', 'Onyx Ape #518', 'Opal Ape #956'])

  // Reaberto, o filtro vem da URL; Home devolve a ponta mínima ao limite e o filtro some da URL
  await applyFilters(page, async () => {
    await expect(minThumb).toHaveAttribute('aria-valuetext', '4,02 ETH')
    await minThumb.press('Home')
    await expect(page.getByText('Preço: 0,02 - 12,30 ETH').filter({ visible: true })).toBeVisible()
  })
  await expect(page).not.toHaveURL(/min=|max=/)
  await expect(resultNames(page)).toHaveCount(12) // catálogo inteiro, primeira página
})

test('troca rápida de página: a consulta obsoleta é cancelada e só a última aparece (cenário flaky)', async ({ page }) => {
  await page.goto('/?scenario=flaky')
  await expect(resultNames(page)).toHaveCount(12)

  const abortedPages: string[] = []
  page.on('requestfailed', (request) => {
    const url = new URL(request.url())
    if (url.pathname === '/api/nfts') abortedPages.push(url.searchParams.get('page') ?? '')
  })

  // No flaky, a página 2 demora mais que a 3 (mesma função do mock: se a premissa mudar, o teste avisa).
  // O Query cancela a 2 (AbortSignal) quando a 3 é pedida; e mesmo sem cancelamento a resposta cairia
  // em outra query key, nunca na tela da página 3.
  const pageUrl = (pageNumber: number) => `/api/nfts?sort=padrao&page=${pageNumber}&pageSize=12`
  expect(flakyLatency(pageUrl(2))).toBeGreaterThan(flakyLatency(pageUrl(3)))
  await page.getByRole('link', { name: 'Página 2' }).click()
  await page.getByRole('link', { name: 'Página 3' }).click()

  await expect(page).toHaveURL(/pagina=3/)
  await expect(resultNames(page).first()).toHaveText('Iron Count #358')
  await page.waitForTimeout(1500) // tempo de sobra para a resposta atrasada chegar, se não tivesse sido cancelada
  await expect(resultNames(page).first()).toHaveText('Iron Count #358')
  expect(abortedPages).toEqual(['2'])
})

test('acesso direto ao detalhe, edição esgotada, limite de quantidade e NFT inexistente', async ({ page }) => {
  await page.goto('/nft/emerald-ape-042')
  await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page.getByRole('radio', { name: '1/10 (esgotada)' })).toBeDisabled()
  await expect(page.getByRole('radio', { name: '1/50' })).toBeChecked()

  // Golden Beat #207: só 1 disponível na edição 1/50
  await page.goto('/nft/golden-beat-207')
  await page.getByRole('radio', { name: '1/50' }).click()
  await expect(page.getByText('1 disponível nesta edição')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()

  await page.goto('/nft/nao-existe')
  await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
})

test('skeleton no carregamento lento, erro com nova tentativa e catálogo vazio', async ({ page }) => {
  await page.goto('/?scenario=slow')
  await expect(page.locator('[data-slot="skeleton"]').first()).toBeVisible()
  await expect(resultNames(page)).toHaveCount(12)

  await page.goto('/nft/sage-nomad-009')
  await expect(page.getByRole('main', { name: 'Carregando NFT' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Sage Nomad #009' })).toBeVisible()

  // 503 em toda requisição: depois das novas tentativas automáticas, a tela de erro aparece
  await page.goto('/?scenario=error-5xx')
  await expect(page.getByRole('heading', { name: 'Não foi possível carregar o catálogo' })).toBeVisible({ timeout: 10_000 })
  await page.evaluate(() => window.__kurioMock!.setScenario('default'))
  await page.getByRole('button', { name: 'Tentar de novo' }).click()
  await expect(resultNames(page)).toHaveCount(12)

  await page.goto('/?scenario=empty')
  await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible()
})
