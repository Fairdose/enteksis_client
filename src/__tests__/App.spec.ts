import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

beforeAll(() => {
  vi.stubGlobal('scrollTo', vi.fn())
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('renders the Turkish landing page', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    await router.isReady()

    expect(wrapper.text()).toContain('Fikrinizi çalışan bir deneyime dönüştürüyoruz.')
    expect(wrapper.text()).toContain('Aklınızdaki projeyi anlatın.')
  })
})
