import { expect, test } from '@playwright/test'

test('mobile navigation opens without horizontal overflow', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/')

  const navigation = page.getByRole('navigation', { name: 'Ana menü' })
  const menuButton = page.getByRole('button', { name: 'Menüyü aç' })

  await expect(menuButton).toBeVisible()
  await expect(navigation).toBeHidden()
  await menuButton.click()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  await expect(navigation).toBeVisible()

  await navigation.getByRole('link', { name: 'İletişim', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Aklınızdaki projeyi anlatın.' })).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
})

test('admin list and detail remain usable on mobile', async ({ page, request }) => {
  const email = `admin-mobile-${Date.now()}@example.com`
  const createResponse = await request.post('http://localhost:8080/api/v1/requests', {
    data: {
      name: 'Mobil Admin Testi',
      email,
      serviceType: 'web-design',
      description: 'Mobil admin görünümünde incelenecek test talebi.',
    },
  })
  expect(createResponse.status()).toBe(201)

  await page.goto('/admin')
  await page.getByLabel('Kullanıcı adı').fill('admin')
  await page.getByLabel('Şifre').fill('123456admin')
  await page.getByRole('button', { name: 'Giriş yap' }).click()
  await page.getByLabel('Talep ara').fill(email)
  await page.getByRole('link', { name: new RegExp(`Mobil Admin Testi ${email}`) }).click()

  await expect(page.getByRole('heading', { name: 'Mobil Admin Testi' })).toBeVisible()
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
})
