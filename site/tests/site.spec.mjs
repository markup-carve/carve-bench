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

test('small-input caveat and diagnostic artifacts are published', async ({ page, request }) => {
  await page.goto('./')
  await expect(page.locator('#full')).toContainText('Small-input timings are unstable.')
  for (const file of ['performance-refresh.md', 'performance-refresh.json', 'small-corpus-check.json', 'full-corpus-initial.json']) {
    expect((await request.get(`reports/${file}`)).ok()).toBeTruthy()
  }
})

test('history selections display measured samples and all tags', async ({ page, request }) => {
  const raw = await (await request.get('reports/engine-history.json')).json()
  await page.goto('reports/engine-history.html')
  await expect(page.getByRole('heading', { name: 'Engine release history' })).toBeVisible()
  await expect(page.locator('#table tbody tr')).toHaveCount(raw.engines.php.revisions.length)
  await page.getByLabel('Engine', { exact: true }).selectOption('rs')
  await page.getByLabel('Case', { exact: true }).selectOption('verse_definitions')
  const originalRows = raw.engines.rs.rows.filter(row => row.case === 'verse_definitions' && row.n === Number(await page.getByLabel('Size', { exact: true }).inputValue()))
  const oldestHash = originalRows.find(row => row.revision === raw.engines.rs.revisions[0].label).output_sha256
  if (originalRows.some(row => row.output_sha256 !== oldestHash)) await expect(page.locator('#table')).toContainText('n/a: different output')
  await page.getByLabel('Case', { exact: true }).selectOption('verse_equivalent')
  await page.getByLabel('Measure', { exact: true }).selectOption('relative')
  await expect(page.locator('#chart svg')).toHaveAttribute('aria-label', /relative to oldest tag/)
  const n = Math.max(...raw.engines.rs.rows.map(row => row.n))
  await page.getByLabel('Size', { exact: true }).selectOption(String(n))
  const row = raw.engines.rs.rows.find(row => row.revision === raw.engines.rs.revisions.at(-1).label && row.case === 'verse_equivalent' && row.n === n)
  await expect(page.locator('#table')).toContainText(row.median_ms.toFixed(3))
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})
