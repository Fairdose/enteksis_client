<script setup lang="ts">
import { usePreferencesStore } from '~store/preferences'

withDefaults(defineProps<{ tone?: 'dark' | 'light' }>(), { tone: 'dark' })
const emit = defineEmits<{ change: [] }>()
const preferences = usePreferencesStore()
</script>

<template>
  <span class="language-picker" :class="`language-picker--${tone}`">
    <span class="language-picker-flag" aria-hidden="true">{{
      preferences.locale === 'tr' ? '🇹🇷' : '🇬🇧'
    }}</span>
    <select
      v-model="preferences.locale"
      :aria-label="preferences.locale === 'tr' ? 'Dil seçimi' : 'Select language'"
      @change="emit('change')"
    >
      <option value="tr">Türkçe</option>
      <option value="en">English</option>
    </select>
    <span class="language-picker-chevron" aria-hidden="true">⌄</span>
  </span>
</template>
