import { expect, test, type Page } from '@playwright/test'
import type {} from '@/mocks/control' // traz o tipo de window.__kurioMock
import { flakyLatency } from '../../src/mocks/flakyLatency'

/*
 * Infra da API simulada: cenários, persistência, reset e o caminho mock → Socket.IO.
 * Cada teste começa num contexto novo do navegador (localStorage vazio = banco no seed).
 */

async function openApp(page: Page, path = '/') {
  await page.goto(path)
  await page.waitForFunction(() => window.__kurioMock !== undefined)
}

function scenarioButton(page: Page, title: string) {
  return page.getByRole('button', { name: `Simulação da API: cenário ${title}` })
}

test('cenário escolhido pela URL vale, sai da URL e sobrevive ao refresh', async ({ page }) => {
  await openApp(page, '/carrinho?scenario=error-5xx')

  await expect(scenarioButton(page, 'Erro no servidor')).toBeVisible()
  expect(new URL(page.url()).searchParams.has('scenario')).toBe(false)

  const status = await page.evaluate(async () => (await fetch('/api/qualquer-recurso')).status)
  expect(status).toBe(503)

  await page.reload()
  await expect(scenarioButton(page, 'Erro no servidor')).toBeVisible()
})

test('painel troca o cenário e o reset restaura o estado inicial', async ({ page }) => {
  await openApp(page)
  await page.evaluate(() => window.__kurioMock!.updateNft('emerald-ape-042', { price: '9.99' }))

  await scenarioButton(page, 'Padrão').click()
  await page.getByRole('radio', { name: /Sem conexão/ }).check()
  await page.getByRole('button', { name: 'Aplicar cenário' }).click()
  await expect(scenarioButton(page, 'Sem conexão')).toBeVisible()
  await expect(page.evaluate(() => fetch('/api/qualquer-recurso'))).rejects.toThrow()

  await scenarioButton(page, 'Sem conexão').click()
  await page.getByRole('button', { name: 'Restaurar dados iniciais' }).click()
  await expect(scenarioButton(page, 'Padrão')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('kurio:mock-db'))).toBeNull()
})

test('mudança no mock persiste após refresh e chega ao socket.io-client como nft.updated', async ({ page }) => {
  await openApp(page)

  // O cliente é o mesmo módulo que o app usa (src/api/socket.ts), conectado pelo layout raiz
  const received = await page.evaluate(async () => {
    // Caminho servido pelo Vite (string em variável: o TypeScript não tenta resolver no Node)
    const socketModulePath = '/src/api/socket.ts'
    const { socket } = (await import(/* @vite-ignore */ socketModulePath)) as typeof import('@/api/socket')
    if (!socket.connected) await new Promise<void>((resolve) => socket.once('connect', () => resolve()))
    const events: unknown[] = []
    socket.on('nft.updated', (event: unknown) => events.push(event))
    window.__kurioMock!.updateNft('emerald-ape-042', { price: '9.99' })
    await new Promise((resolve) => setTimeout(resolve, 300))
    return events
  })

  expect(received).toEqual([
    expect.objectContaining({ eventId: 'nft:emerald-ape-042:v2', resource: 'nft', id: 'emerald-ape-042', version: 2, data: expect.objectContaining({ price: '9.99' }) }),
  ])

  await page.reload()
  const savedNft = await page.evaluate(() => JSON.parse(localStorage.getItem('kurio:mock-db')!).nfts.find((nft: { id: string }) => nft.id === 'emerald-ape-042'))
  expect(savedNft).toMatchObject({ price: '9.99', version: 2 })
})

test('latência variável entrega respostas fora de ordem (cenário flaky)', async ({ page }) => {
  await openApp(page, '/?scenario=flaky')

  // A mais lenta é pedida primeiro: chegar depois da segunda prova a entrega fora de ordem
  const [slower, faster] = ['/api/primeira', '/api/segunda'].sort((a, b) => flakyLatency(b) - flakyLatency(a))
  expect(flakyLatency(slower!)).toBeGreaterThan(flakyLatency(faster!))

  const arrivalOrder = await page.evaluate(async (paths) => {
    const arrived: string[] = []
    await Promise.all(paths.map((path) => fetch(path).then(() => arrived.push(path))))
    return arrived
  }, [slower!, faster!])

  expect(arrivalOrder).toEqual([faster, slower])
})
