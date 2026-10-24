import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control'

async function login(page: Page, email = 'nova@kurio.dev') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('kurio123')
  await page.getByLabel('Senha', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/\/$/)
}

async function orderIdsInMock(page: Page) {
  return page.evaluate(() => {
    const database = JSON.parse(localStorage.getItem('kurio:mock-db')!) as { ordersById: Record<string, unknown> }
    return Object.keys(database.ordersById)
  })
}

async function prepareReview(page: Page, nftId = 'amber-ape-117', quantity = 1) {
  await login(page)
  await page.goto(`/nft/${nftId}`)
  const quantityGroup = page.getByRole('group', { name: /Quantidade de/ })
  for (let current = 1; current < quantity; current += 1) {
    await quantityGroup.getByRole('button', { name: 'Aumentar quantidade' }).click()
  }
  await page.getByRole('button', { name: 'Comprar NFT' }).click()
  await expect(page).toHaveURL(/\/carrinho$/)
  await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByRole('button', { name: 'Revisar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Revisão do pedido' })).toBeVisible()
}

test('compra completa passa por pendente, confirma, sobrevive ao refresh e limpa o item comprado', async ({ page }) => {
  await prepareReview(page)

  const created = page.waitForResponse((response) => response.url().endsWith('/api/orders') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  const createdResponse = await created
  expect(createdResponse.status()).toBe(201)
  expect((await createdResponse.json() as { status: string }).status).toBe('pending')
  await expect(page).toHaveURL(/\/pedido\/ord-/)
  const orderId = page.url().split('/pedido/')[1]

  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 10_000 })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  expect(page.url()).toContain(`/pedido/${orderId}`)

  await page.goto('/carrinho')
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
})

test('pagamento recusado mostra o motivo e preserva o carrinho', async ({ page }) => {
  await prepareReview(page)
  await page.evaluate(() => window.__kurioMock!.setScenario('payment-rejected'))
  await page.getByRole('button', { name: 'Confirmar compra' }).click()

  await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(/Seus itens continuam no carrinho/)).toBeVisible()
  await page.getByRole('link', { name: 'Voltar ao carrinho' }).click()
  await expect(page.getByRole('heading', { name: 'Amber Ape #117' })).toBeVisible()
})

test('clique repetido cria um pedido só e a mesma chave protege contra payload diferente', async ({ page }) => {
  await prepareReview(page)
  let requests = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/orders') && request.method() === 'POST') requests += 1
  })

  await page.getByRole('button', { name: 'Confirmar compra' }).evaluate((button: HTMLButtonElement) => {
    button.click()
    button.click()
  })
  await expect(page).toHaveURL(/\/pedido\/ord-/)
  await expect.poll(() => requests).toBe(2)
  const repeatedClickRequests = requests

  const result = await page.evaluate(async () => {
    const database = JSON.parse(localStorage.getItem('kurio:mock-db')!) as {
      ordersById: Record<string, unknown>
      idempotencyByUserId: Record<string, Record<string, { orderId: string }>>
    }
    const entries = Object.entries(database.idempotencyByUserId['user-nova'] ?? {})
    const [key, attempt] = entries[0]!
    const order = database.ordersById[attempt.orderId] as { id: string }
    const token = localStorage.getItem('kurio:session-token')!
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({
        buyerName: 'Outro nome',
        buyerEmail: 'nova@kurio.dev',
        walletId: 'wallet-nova-primary',
        walletProvider: 'metamask',
        network: 'ethereum',
        quoteId: 'quote-outro-payload',
      }),
    })
    return {
      requestStatus: response.status,
      orderId: order.id,
      orderCount: Object.keys(database.ordersById).length,
    }
  })

  expect(repeatedClickRequests).toBe(2)
  expect(result.orderCount).toBe(1)
  expect(result.orderId).toMatch(/^ord-/)
  expect(result.requestStatus).toBe(409)
})

test('timeout recupera exatamente o pedido já criado', async ({ page }) => {
  // Relógio controlado: o app segue em tempo real e o teste avança os 8 s do limite de espera sem esperá-los
  await page.clock.install()
  await prepareReview(page)
  await page.evaluate(() => window.__kurioMock!.setScenario('order-timeout'))
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await page.clock.fastForward(10_000)

  // Sem resposta, o botão volta como "Recuperar pedido". Pode ser pelo alerta de timeout ou, quando o socket avisa
  // antes que o pedido foi confirmado, pela tela de recuperação (o carrinho já esvaziou): o botão é o mesmo.
  await expect(page.getByRole('button', { name: 'Recuperar pedido' })).toBeEnabled({ timeout: 12_000 })
  const beforeRecovery = await orderIdsInMock(page)
  expect(beforeRecovery).toHaveLength(1)

  await page.getByRole('button', { name: 'Recuperar pedido' }).click()
  await expect(page).toHaveURL(new RegExp(`/pedido/${beforeRecovery[0]}$`))
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  expect(await orderIdsInMock(page)).toEqual(beforeRecovery)
})

test('recuperação após refresh funciona com o carrinho já esvaziado pelo pedido', async ({ page }) => {
  await page.clock.install()
  await prepareReview(page)
  await page.evaluate(() => window.__kurioMock!.setScenario('order-timeout'))
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await page.clock.fastForward(10_000)
  // Sem resposta, o botão volta como "Recuperar pedido". Pode ser pelo alerta de timeout ou, quando o socket avisa
  // antes que o pedido foi confirmado, pela tela de recuperação (o carrinho já esvaziou): o botão é o mesmo.
  await expect(page.getByRole('button', { name: 'Recuperar pedido' })).toBeEnabled({ timeout: 12_000 })
  const createdOrders = await orderIdsInMock(page)
  expect(createdOrders).toHaveLength(1)

  // O pedido já foi confirmado e esvaziou o carrinho; o refresh também descarta o estado da
  // mutation. A recuperação precisa aparecer mesmo assim e reenviar o payload salvo, não o
  // de uma cotação nova: com a mesma chave e outro payload, o servidor responderia 409.
  await page.reload()
  await expect(page.getByRole('button', { name: 'Recuperar pedido' })).toBeEnabled()
  await page.getByRole('button', { name: 'Recuperar pedido' }).click()

  await expect(page).toHaveURL(new RegExp(`/pedido/${createdOrders[0]}$`))
  expect(await orderIdsInMock(page)).toEqual(createdOrders)
})

test('mudança de preço e estoque exige nova confirmação e remove somente a quantidade comprada', async ({ page }) => {
  await prepareReview(page, 'ivory-baron-088', 2)
  // Sem socket o cliente não fica sabendo da mudança: o servidor precisa recusar a cotação velha.
  // (Com o socket ligado a tela já se atualizaria sozinha; isso é coberto em realtime.spec.ts.)
  await page.evaluate(() => window.__kurioMock!.setScenario('offline'))
  await page.evaluate(() => {
    const database = JSON.parse(localStorage.getItem('kurio:mock-db')!) as {
      nfts: Array<{ id: string; editions: Array<{ id: string; label: string; supply: number | null; available: number }> }>
    }
    const nft = database.nfts.find((item) => item.id === 'ivory-baron-088')!
    const editions = nft.editions.map((edition) => edition.id === 'ivory-baron-088-1-10' ? { ...edition, available: 1 } : edition)
    window.__kurioMock!.updateNft('ivory-baron-088', { price: '1.99', previousPrice: '1.79', editions })
  })
  // O clique acontece antes de o socket reconectar (reconexão leva ao menos 0,5 s)
  await page.evaluate(() => window.__kurioMock!.setScenario('default'))

  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByText('Preço ou disponibilidade mudou. Confira os valores abaixo e confirme novamente.')).toBeVisible()
  await expect(page.getByText('Edição 1/10 · 1× (de 2)')).toBeVisible()
  await expect(page.getByText('2.006 ETH')).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar alterações e comprar' }).click()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 10_000 })
  await page.goto('/carrinho')
  await expect(page.getByRole('group', { name: 'Quantidade de Ivory Baron #088' }).getByRole('status')).toHaveText('1')
})

test('pedido de outro usuário responde como não encontrado', async ({ page }) => {
  await prepareReview(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/pedido\/ord-/)
  const novaOrderUrl = new URL(page.url()).pathname

  await page.goto('/conta/perfil')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  await login(page, 'theo@kurio.dev')
  await page.goto(novaOrderUrl)
  await expect(page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible()
})

test('recibo confirmado reproduz o snapshot do pedido, mesmo se o catálogo mudar depois', async ({ page }) => {
  await prepareReview(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 10_000 })

  const receipt = page.getByRole('main')
  await expect(receipt).toContainText('ID da transação')
  await expect(receipt).toContainText('Amber Ape #117')
  const before = await receipt.innerText()

  // Preço do catálogo muda depois da compra: o recibo guarda os valores do momento do pedido
  await page.evaluate(() => window.__kurioMock!.updateNft('amber-ape-117', { price: '9.99' }))
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  expect(await receipt.innerText()).toBe(before)
  await expect(receipt).not.toContainText('9.99')
})
