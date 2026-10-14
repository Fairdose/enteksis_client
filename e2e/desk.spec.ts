import { expect, test } from '@playwright/test'
import { adminCredentials } from './support/admin'

test('Benim Masam görev akışı ve ürün PDF bağlantısı çalışır', async ({ page, request }) => {
  const pdf = await request.get('/enteksis-urun-tanitimi.pdf')
  expect(pdf.status()).toBe(200)
  expect(pdf.headers()['content-type']).toContain('application/pdf')

  await page.goto('/admin/masa')
  await page.getByLabel('E-posta').fill(adminCredentials.username)
  await page.getByLabel('Şifre').fill(adminCredentials.password)
  await page.getByRole('button', { name: 'Giriş yap' }).click()
  await expect(page.getByRole('heading', { name: 'Benim Masam' })).toBeVisible()

  await page.getByRole('button', { name: 'Ekip ve proje' }).click()
  const setup = page.getByRole('dialog', { name: 'Ekip ve proje' })
  const projectName = `Kabul akışı ${Date.now()}`
  await setup.getByLabel('Proje adı').fill(projectName)
  await setup.getByRole('button', { name: 'Projeyi oluştur' }).click()
  await expect(page.locator('.desk-notice')).toHaveText('Proje oluşturuldu.')
  await setup.getByRole('button', { name: 'Kapat' }).click()

  await page.getByRole('button', { name: '+ Yeni görev' }).click()
  const create = page.getByRole('dialog', { name: 'Yeni görev' })
  const title = `Teslim kontrolü ${Date.now()}`
  await create.getByLabel('Görev başlığı').fill(title)
  await create.getByLabel('İnceleyen').selectOption({ label: 'Yönetici' })
  await create.getByLabel('Kabul ölçütleri (her satıra bir ölçüt)').fill('Teslim bağlantısı açılmalı')
  await create.getByLabel('Her ölçüt için kanıt bağlantısı iste').check()
  await create.getByRole('button', { name: 'Görevi oluştur' }).click()
  await expect(page.getByRole('button', { name: new RegExp(title) })).toBeVisible()

  await page.getByRole('button', { name: new RegExp(title) }).click()
  const detail = page.getByRole('dialog', { name: title })
  await detail.getByRole('button', { name: 'Hazır yap' }).click()
  await expect(detail.getByText('Hazır', { exact: true })).toBeVisible()
  await detail.getByRole('button', { name: 'Çalışmaya başla' }).click()
  await expect(detail.getByText('Devam ediyor', { exact: true })).toBeVisible()
  await detail.getByLabel('Kanıt bağlantısı').fill('https://example.com/teslim')
  await detail.getByLabel('İşlem notu / engel gerekçesi').fill('Kontrol için hazır.')
  await detail.getByRole('button', { name: 'Teslim et' }).click()
  await expect(detail.getByRole('button', { name: 'Kabul et' })).toBeVisible()
  await detail.getByRole('button', { name: 'Kabul et' }).click()
  await expect(detail.getByText('Kapandı', { exact: true })).toBeVisible()
})
