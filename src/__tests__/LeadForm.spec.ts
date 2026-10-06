import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LeadForm from '~views/home/_components/LeadForm.vue'

function mountForm() {
  return mount(LeadForm, {
    global: { plugins: [createPinia()] },
  })
}

async function fillValidForm(wrapper: ReturnType<typeof mountForm>) {
  await wrapper.get('#name').setValue('Ada Lovelace')
  await wrapper.get('#email').setValue('ada@example.com')
  await wrapper.get('#service').setValue('software-development')
  await wrapper.get('#description').setValue('Yeni bir web uygulaması geliştirmek istiyorum.')
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LeadForm', () => {
  it('validates required fields before sending', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const wrapper = mountForm()

    await wrapper.get('form').trigger('submit')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Lütfen en az 2 karakter girin.')
    expect(wrapper.findAll('[aria-invalid="true"]')).toHaveLength(4)
  })

  it('shows success only after the API confirms persistence', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'request-id', createdAt: new Date().toISOString() }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const wrapper = mountForm()
    await fillValidForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Talebiniz bize ulaştı.')
  })

  it('shows an error when persistence fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Talebiniz şu anda kaydedilemedi.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const wrapper = mountForm()
    await fillValidForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Talebiniz şu anda kaydedilemedi.')
    expect(wrapper.text()).not.toContain('Talebiniz bize ulaştı.')
  })
})
