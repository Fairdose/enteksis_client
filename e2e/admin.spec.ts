import { expect, test } from '@playwright/test'

test('admin signs in, inspects a request and prepares a mailto reply', async ({ page, request }) => {
  const email = `admin-flow-${Date.now()}@example.com`
  const createResponse = await request.post('http://localhost:8080/api/v1/requests', {
    data: {
      name: 'Admin Akış Testi',
      email,
      serviceType: 'digital-consulting',
      description: 'Yönetim ekranında incelenecek kalıcı test talebi.',
    },
  })
  expect(createResponse.status()).toBe(201)

  await page.goto('/')
  await page.evaluate(() => window.sessionStorage.clear())
  await page.goto('/admin/requests')

  await expect(page).toHaveURL(/\/admin(?:\?.*)?$/)
  await expect(page.getByRole('heading', { name: 'Hizmet taleplerini yönetin.' })).toBeVisible()

  await page.getByLabel('Kullanıcı adı').fill('yanlis')
  await page.getByLabel('Şifre').fill('yanlis')
  await page.getByRole('button', { name: 'Giriş yap' }).click()
  await expect(page.getByRole('alert')).toHaveText('Yönetici erişimi gerekli.')

  await page.getByLabel('Kullanıcı adı').fill('admin')
  await page.getByLabel('Şifre').fill('123456admin')
  await page.getByRole('button', { name: 'Giriş yap' }).click()

  await expect(page).toHaveURL(/\/admin\/requests$/)
  await expect(page.getByRole('heading', { name: 'Hizmet talepleri' })).toBeVisible()
  await page.getByLabel('Talep ara').fill(email)

  const requestLink = page.getByRole('link', { name: new RegExp(`Admin Akış Testi ${email}`) })
  await expect(requestLink).toBeVisible()
  await requestLink.click()

  await expect(page.getByRole('heading', { name: 'Admin Akış Testi' })).toBeVisible()
  await expect(page.getByText('Yönetim ekranında incelenecek kalıcı test talebi.')).toBeVisible()

  await page.getByLabel('Konu').fill('Projeniz hakkında görüşme')
  await page.getByLabel('Mesaj').fill('Merhaba, talebinizi değerlendirdik. Görüşmek isteriz.')
  const replyLink = page.getByRole('link', { name: 'E-posta uygulamasını aç' })
  await expect(replyLink).toHaveAttribute(
    'href',
    new RegExp(`^mailto:${email}\\?subject=Projeniz%20hakk%C4%B1nda%20g%C3%B6r%C3%BC%C5%9Fme&body=`),
  )
})
