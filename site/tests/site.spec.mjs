import { test, expect } from '@playwright/test'

test('language, measure and document filters show the measured rows', async ({ page, request }) => {
  const data = await (await request.get('evidence.json')).json()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'How fast is Carve 0.2?' })).toBeVisible()
  for (const lane of data.lanes) {
    await page.getByLabel('Language').selectOption(lane.id)
    for (const phase of ['html', 'parse']) {
      await page.getByLabel('Measure').selectOption(phase)
      const name = lane.documents.at(-1)
      await page.getByLabel('Document').selectOption(name)
      const rows = lane.rows.filter(row => row.phase === phase && row.document === name)
      await expect(page.locator('.bars li')).toHaveCount(rows.length)
      for (const row of rows) await expect(page.locator('.bars')).toContainText(`${row.mbps.toFixed(1)} MB/s`)
    }
  }
  await expect(page.locator('.bars .bar.carve')).toHaveCount(data.lanes.at(-1).engines.filter(engine => engine.id.startsWith('carve02')).length)
  for (const image of await page.locator('figure img').all()) expect((await request.get(await image.getAttribute('src'))).ok()).toBeTruthy()
  for (const link of await page.locator('a[download]').all()) expect((await request.get(await link.getAttribute('href'))).ok()).toBeTruthy()
  expect(errors).toEqual([])
})

test('mobile layout and static results work without JavaScript', async ({ browser, request }) => {
  const data = await (await request.get('evidence.json')).json()
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'How fast is Carve 0.2?' })).toBeVisible()
  await expect(page.locator('#filter-controls')).toBeHidden()
  await expect(page.locator('#lanes .language-table')).toHaveCount(data.lanes.length * 2)
  await expect(page.locator('#versus tbody tr')).toHaveCount(data.lanes.length * 2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await context.close()
})

test('a failed results fetch keeps the static charts and tables', async ({ page }) => {
  await page.route('**/evidence.json', route => route.fulfill({ status: 503, body: 'unavailable' }))
  await page.goto('./')
  await expect(page.locator('#interactive-chart')).toContainText('Interactive chart unavailable')
  await expect(page.locator('#filter-controls')).toBeHidden()
  await expect(page.locator('#versus figure img')).toHaveCount(1)
})

test('dark mode charts carry their own dark palette', async ({ page, request }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')
  for (const image of await page.locator('figure img').all()) {
    const svg = await (await request.get(await image.getAttribute('src'))).text()
    expect(svg).toMatch(/prefers-color-scheme: ?dark/)
  }
})

test('the 0.1 archive is reachable from the landing page and links back', async ({ page }) => {
  await page.goto('./')
  await page.locator('header').getByRole('link', { name: '0.1 archive' }).click()
  await expect(page).toHaveURL(/\/carve-bench\/0\.1\/$/)
  await expect(page.locator('.archive-banner')).toContainText('Archived Carve 0.1 results')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.locator('.archive-banner').getByRole('link', { name: 'Current Carve 0.2 results' }).click()
  await expect(page.getByRole('heading', { name: 'How fast is Carve 0.2?' })).toBeVisible()
})
