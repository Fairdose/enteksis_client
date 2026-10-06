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
