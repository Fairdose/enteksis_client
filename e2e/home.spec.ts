import { expect, type Page, test } from '@playwright/test'

async function openClean(page: Page, path = '/') {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(path)
}

test('loads in Turkish and persists the selected language', async ({ page }) => {
  await openClean(page)

  await expect(page).toHaveTitle('Ent Challange — Dijital ürün stüdyosu')
  await expect(page.getByLabel('Ent Challange ana sayfa').first()).toContainText('ent-challange')
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fikrinizi')

  await page.getByRole('button', { name: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('We turn your idea into')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('button', { name: 'Türkçe' })).toBeVisible()
})

test('validates all required fields before sending a request', async ({ page }) => {
  let requestCount = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/v1/requests')) requestCount += 1
  })

  await openClean(page, '/#contact')
  await page.getByRole('button', { name: 'Talebimi gönder' }).click()

  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(4)
  await expect(page.getByLabel('İsim')).toBeFocused()
  await expect(page.getByText('Geçerli bir e-posta adresi girin.')).toBeVisible()
  expect(requestCount).toBe(0)
})

test('shows success only after the API persists the request', async ({ page }) => {
  const email = `playwright-${Date.now()}@example.com`

  await openClean(page, '/#contact')
  await page.getByLabel('İsim').fill('Playwright Test')
  await page.getByLabel('E-posta').fill(email)
  await page.getByLabel('İlgilendiğiniz hizmet').selectOption('software-development')
  await page
    .getByLabel('Projeniz hakkında')
    .fill('Docker üzerindeki gerçek API ve PostgreSQL kayıt akışı testi.')

  const responsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/v1/requests') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Talebimi gönder' }).click()
  const response = await responsePromise

  expect(response.status()).toBe(201)
  await expect(page.getByRole('heading', { name: 'Talebiniz bize ulaştı.' })).toBeVisible()
})

test('keeps success hidden and reports a backend failure', async ({ page }) => {
  await page.route('**/api/v1/requests', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Test sunucu hatası.' }),
    })
  })

  await openClean(page, '/#contact')
  await page.getByLabel('İsim').fill('Hata Testi')
  await page.getByLabel('E-posta').fill('error@example.com')
  await page.getByLabel('İlgilendiğiniz hizmet').selectOption('web-design')
  await page.getByLabel('Projeniz hakkında').fill('Sunucu hata durumunu doğrulayan açıklama.')

  await page.getByRole('button', { name: 'Talebimi gönder' }).click()
  await expect(page.getByRole('button', { name: 'Gönderiliyor…' })).toBeDisabled()
  await expect(page.getByRole('alert')).toHaveText(/Test sunucu hatası/)
  await expect(page.getByRole('heading', { name: 'Talebiniz bize ulaştı.' })).toHaveCount(0)
})
