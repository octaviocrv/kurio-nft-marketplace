import { expect, test } from '@playwright/test'

// O app só renderiza depois que o MSW assume a página (src/main.tsx).
// Se a ordem quebrar, as primeiras chamadas à API escapariam do mock.
test('a aplicação abre com o MSW controlando a página', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Kurio — marketplace de NFTs' })).toBeAttached()
  const isControlledByWorker = await page.evaluate(() => navigator.serviceWorker.controller !== null)
  expect(isControlledByWorker).toBe(true)
})
