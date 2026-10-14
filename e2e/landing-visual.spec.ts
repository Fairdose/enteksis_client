import { expect, test } from '@playwright/test'

test('hero remains usable without horizontal overflow across breakpoints', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(page.locator('.hero-actions a[href="/admin/masa"]')).toBeVisible()

  for (const width of [320, 390, 620, 621, 900, 901, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const layout = await page.evaluate(() => {
      const cta = document.querySelector<HTMLAnchorElement>('.hero-actions a[href="/admin/masa"]')
      const bounds = cta?.getBoundingClientRect()
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        ctaLeft: bounds?.left,
        ctaRight: bounds?.right,
      }
    })

    expect(layout.document, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(
      layout.viewport,
    )
    expect(layout.ctaLeft, `CTA left edge at ${width}px`).toBeGreaterThanOrEqual(0)
    expect(layout.ctaRight, `CTA right edge at ${width}px`).toBeLessThanOrEqual(width)
  }
})

test('decorative 3D motion respects reduced-motion preference', async ({ page }) => {
  await page.goto('/')

  const board = page.locator('.art-board')
  await expect(board).toBeVisible()
  await expect(page.locator('.hero-art')).toHaveAttribute('aria-hidden', 'true')

  const durationInSeconds = (duration: string) =>
    duration.endsWith('ms') ? parseFloat(duration) / 1000 : parseFloat(duration)

  const normal = await board.evaluate((element) => getComputedStyle(element).animationDuration)
  expect(durationInSeconds(normal)).toBeGreaterThan(0.1)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reduced = await board.evaluate((element) => getComputedStyle(element).animationDuration)
  expect(durationInSeconds(reduced)).toBeLessThanOrEqual(0.001)
})
