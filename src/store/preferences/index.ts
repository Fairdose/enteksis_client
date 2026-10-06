import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'

import type { PreferencesState } from './types'

export const usePreferencesStore = defineStore('preferences', {
  state: (): PreferencesState => ({
    locale: 'tr',
    selectedService: '',
  }),
  persist: {
    pick: ['locale', 'selectedService'],
  },
})

export type { Locale, PreferencesState } from './types'
