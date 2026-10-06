import { expect, test } from '@playwright/test'

test('keeps the public header sticky while the page scrolls', async ({ page }) => {
  await page.goto('/')

  const header = page.locator('.site-header')
  await expect(header).toHaveCSS('position', 'sticky')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(header).toBeInViewport()
})

test('keeps the admin header sticky', async ({ page }) => {
  await page.goto('/admin')

  const header = page.locator('.admin-header')
  await expect(header).toHaveCSS('position', 'sticky')
  await expect(header).toBeInViewport()
})
