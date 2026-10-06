import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { messages } from '@/i18n/messages'
import { usePreferencesStore } from '~store/preferences'

export function useCopy() {
  const preferences = usePreferencesStore()
  const { locale } = storeToRefs(preferences)
  const copy = computed(() => messages[locale.value])

  return { copy, locale }
}
