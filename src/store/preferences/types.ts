export type Locale = 'tr' | 'en'

export interface PreferencesState {
  locale: Locale
  selectedService: string
}
