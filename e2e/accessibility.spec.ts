import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()

  expect(results.violations).toEqual([])
}

test('public page meets automated WCAG A and AA checks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expectNoAccessibilityViolations(page)
})

test('admin login meets automated WCAG A and AA checks', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Hizmet taleplerini yönetin.' })).toBeVisible()
  await expectNoAccessibilityViolations(page)
})
