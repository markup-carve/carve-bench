import { test, expect } from '@playwright/test'

test('language filter uses measured rows and downloads match the report', async ({ page, request }) => {
  const data = await (await request.get('evidence.json')).json()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  await expect(page.locator('.bars li')).toHaveCount(10)
  await page.getByLabel('Compare language').selectOption('PHP')
  await expect(page.locator('.bars li')).toHaveCount(3)
  await expect(page.locator('.language-table:visible')).toHaveCount(1)
  for (const row of data.peers.filter(row => row.language === 'PHP')) await expect(page.locator('.bars')).toContainText(`${row.throughput.toFixed(2)} MB/s`)
  const csv = await (await request.get('core-throughput.csv')).text()
  expect(csv.trim().split('\n')).toHaveLength(11)
  for (const row of data.peers) expect(csv).toContain(`${row.language},${row.engine},${row.throughput}`)
  for (const image of await page.locator('figure img').all()) expect((await request.get(await image.getAttribute('src'))).ok()).toBeTruthy()
  expect(errors).toEqual([])
})

test('mobile layout and static results work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'How fast does Carve render?' })).toBeVisible()
  await expect(page.locator('#core tbody tr')).toHaveCount(13)
  await expect(page.getByRole('heading', { name: 'Method and source commits' })).toBeAttached()
  await context.close()
})

test('snapshot fetch failure preserves static results', async ({ page }) => {
  await page.route('**/evidence.json', route => route.fulfill({ status: 503, body: 'unavailable' }))
  await page.goto('./')
  await expect(page.locator('#interactive-chart')).toContainText('Interactive chart unavailable')
  await expect(page.locator('#core tbody tr')).toHaveCount(13)
})

test('dark mode exposes readable charts and downloads under the project path', async ({ page, request }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.locator('.bars li')).toHaveCount(10)
  await page.addStyleTag({ content: 'body { font-family: monospace }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  for (const link of await page.locator('a[download]').all()) expect((await request.get(await link.getAttribute('href'))).ok()).toBeTruthy()
  await page.locator('figure').first().scrollIntoViewIfNeeded()
  for (const image of await page.locator('figure img').all()) {
    const svg = await (await request.get(await image.getAttribute('src'))).text()
    expect(svg).toContain('@media(prefers-color-scheme:dark)')
  }
})
