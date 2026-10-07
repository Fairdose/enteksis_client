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

test('keeps service headings fixed while their card is hovered', async ({ page }) => {
  await page.goto('/')

  const card = page.locator('.service-card').first()
  const heading = card.locator('.service-copy > h3')
  await page.evaluate(() => document.fonts.load('600 2.2rem Manrope'))
  await expect(heading).toBeVisible()

  const headingGeometry = () =>
    heading.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
      }
    })
  const before = await headingGeometry()

  await card.hover()

  const after = await headingGeometry()
  expect(after.left).toBeCloseTo(before.left, 3)
  expect(after.top).toBeCloseTo(before.top, 3)
  expect(after.width).toBeCloseTo(before.width, 3)
})
