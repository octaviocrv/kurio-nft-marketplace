import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control'

async function login(page: Page, email = 'nova@kurio.dev') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/\/$/)
}

async function addToCart(page: Page, nftId = 'amber-ape-117') {
  await page.goto(`/nft/${nftId}`)
  await page.getByRole('button', { name: 'Comprar NFT' }).click()
  await expect(page).toHaveURL(/\/carrinho$/)
}

async function openReview(page: Page) {
  await login(page)
  await addToCart(page)
  await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByRole('button', { name: 'Revisar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Revisão do pedido' })).toBeVisible()
}

/** Escuta o cliente Socket.IO real do app (mesmo módulo): só observa o que chega, não injeta nada na interface. */
async function observeSocket(page: Page) {
  await page.evaluate(async () => {
    const modulePath = '/src/api/socket.ts'
    const { socket } = (await import(/* @vite-ignore */ modulePath)) as { socket: { on: (event: string, listener: () => void) => void } }
    const received: string[] = []
    ;(window as unknown as { __received: string[] }).__received = received
    for (const event of ['order.updated', 'nft.updated']) socket.on(event, () => received.push(event))
  })
}
const receivedEvents = (page: Page) => page.evaluate(() => (window as unknown as { __received: string[] }).__received)

const changePrice = (page: Page, price: string) =>
  page.evaluate((newPrice) => window.__kurioMock!.updateNft('amber-ape-117', { price: newPrice, previousPrice: null }), price)

test('mudança de preço pelo socket avisa, atualiza o resumo e bloqueia a confirmação até a nova cotação', async ({ page }) => {
  test.slow()
  await openReview(page)
  const confirm = page.getByRole('button', { name: /^Confirmar/ })
  await expect(confirm).toHaveText('Confirmar compra')

  // Com a API lenta dá para observar a janela entre o evento e a cotação nova
  await page.evaluate(() => window.__kurioMock!.setScenario('slow'))
  await changePrice(page, '3.33')

  await expect(confirm).toBeDisabled()
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'O preço de Amber Ape #117 mudou' })).toContainText('para 3.33 ETH', { timeout: 15_000 })
  await expect(confirm).toBeEnabled({ timeout: 15_000 })
  await expect(confirm).toHaveText('Confirmar alterações e comprar')
  await expect(page.getByText('Preço ou disponibilidade mudou. Confira os valores abaixo e confirme novamente.')).toBeVisible()
  await expect(page.getByText('3.33 ETH').filter({ visible: true }).first()).toBeVisible()

  await page.evaluate(() => window.__kurioMock!.setScenario('default'))
  await confirm.click()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 10_000 })
})

test('disponibilidade zerada de item do carrinho avisa que esgotou', async ({ page }) => {
  await login(page)
  await addToCart(page)

  await page.evaluate(() => {
    type Edition = { id: string; label: string; supply: number | null; available: number }
    const database = JSON.parse(localStorage.getItem('kurio:mock-db')!) as { nfts: Array<{ id: string; editions: Edition[] }> }
    const nft = database.nfts.find((item) => item.id === 'amber-ape-117')!
    window.__kurioMock!.updateNft('amber-ape-117', { editions: nft.editions.map((edition) => ({ ...edition, available: 0 })) })
  })
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'esgotou' })).toContainText('Amber Ape #117')
})

test('detalhe do NFT ignora evento duplicado e antigo; só o mais novo vence', async ({ page }) => {
  await login(page)
  await page.goto('/nft/amber-ape-117')
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()

  const newer = await changePrice(page, '3.33')
  await expect(page.getByText('3.33 ETH').filter({ visible: true }).first()).toBeVisible()

  await page.evaluate((event) => {
    window.__kurioMock!.replayEvent('nft.updated', event) // duplicata exata
    window.__kurioMock!.replayEvent('nft.updated', { ...event, eventId: `nft:${event.id}:v${event.version - 1}`, version: event.version - 1, data: { ...event.data, price: '1.11' } }) // versão antiga
  }, newer)
  // Eventos chegam em ordem: quando este aparece, os dois reenvios acima já foram processados
  await changePrice(page, '4.44')
  await expect(page.getByText('4.44 ETH').filter({ visible: true }).first()).toBeVisible()
  await expect(page.getByText('1.11 ETH')).toHaveCount(0)
  await expect(page.getByText('3.33 ETH')).toHaveCount(0)
})

test('evento duplicado ou antigo não dispara nova reconciliação do carrinho', async ({ page }) => {
  await login(page)
  await addToCart(page)
  let cartRequests = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/cart/items') && request.method() === 'GET') cartRequests += 1
  })

  const first = await changePrice(page, '3.33')
  await expect.poll(() => cartRequests).toBe(1)

  await page.evaluate((event) => {
    window.__kurioMock!.replayEvent('nft.updated', event)
    window.__kurioMock!.replayEvent('nft.updated', { ...event, eventId: `nft:${event.id}:v${event.version - 1}`, version: event.version - 1 })
  }, first)
  const last = await changePrice(page, '4.44')
  await expect(page.getByText('4.44 ETH').filter({ visible: true }).first()).toBeVisible()
  // Uma busca para o primeiro evento e uma para o último; duplicata e antigo não geraram nenhuma
  expect(cartRequests).toBe(2)
  expect(last.version).toBe(first.version + 1)
})

test('depois de uma queda, a reconexão reconcilia com a API e recupera a mudança perdida', async ({ page }) => {
  await login(page)
  await page.goto('/nft/amber-ape-117')
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()

  await page.evaluate(() => window.__kurioMock!.setScenario('offline'))
  await changePrice(page, '5.55') // ninguém conectado: o evento se perde, só o REST sabe
  await page.evaluate(() => window.__kurioMock!.setScenario('default'))

  await expect(page.getByText('5.55 ETH').filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 })
})

test('queda de conexão com pedido pendente: a tela recupera o mesmo pedido, sem nova compra', async ({ page }) => {
  test.slow()
  await openReview(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/pedido\/ord-/)
  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()

  await page.evaluate(() => window.__kurioMock!.setScenario('offline'))
  // O pedido é decidido no servidor mesmo sem ninguém conectado; o evento se perde
  await expect
    .poll(() => page.evaluate(() => Object.values((JSON.parse(localStorage.getItem('kurio:mock-db')!) as { ordersById: Record<string, { status: string }> }).ordersById).map((order) => order.status)))
    .toEqual(['confirmed'])
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toHaveCount(0)

  await page.evaluate(() => window.__kurioMock!.setScenario('default'))
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 15_000 })
  expect(await page.evaluate(() => Object.keys((JSON.parse(localStorage.getItem('kurio:mock-db')!) as { ordersById: object }).ordersById).length)).toBe(1)
})

test('evento privado de pedido só chega ao dono, nunca a outro usuário na mesma aba', async ({ page }) => {
  test.slow()
  await openReview(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 10_000 })

  const replayOrder = () =>
    page.evaluate(() => {
      const database = JSON.parse(localStorage.getItem('kurio:mock-db')!) as { ordersById: Record<string, { id: string }> }
      const order = Object.values(database.ordersById)[0]!
      window.__kurioMock!.replayEvent('order.updated', { eventId: `order:${order.id}:v99`, resource: 'order', id: order.id, version: 99, data: order })
    })
  const switchUser = async (email: string) => {
    await page.goto('/conta/perfil')
    await page.getByRole('button', { name: 'Sair da conta' }).click()
    await login(page, email)
    await observeSocket(page)
  }

  // O pedido é da Nova; a conexão agora é do Theo
  await switchUser('theo@kurio.dev')
  await replayOrder()
  await changePrice(page, '6.66') // evento público depois do privado: quando chega, o privado já teria chegado
  await expect.poll(() => receivedEvents(page)).toContain('nft.updated')
  expect(await receivedEvents(page)).not.toContain('order.updated')

  // Controle positivo: o mesmo reenvio chega quando a conexão é do dono
  await switchUser('nova@kurio.dev')
  await replayOrder()
  await expect.poll(() => receivedEvents(page)).toContain('order.updated')
})
