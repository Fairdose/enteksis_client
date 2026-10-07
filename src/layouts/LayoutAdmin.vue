<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import BrandMark from '~components/brand/BrandMark.vue'
import { useCopy } from '@/composables/useCopy'
import { useAdminStore } from '~store/admin'
import { usePreferencesStore, type Locale } from '~store/preferences'

const admin = useAdminStore()
const preferences = usePreferencesStore()
const router = useRouter()
const { copy, locale } = useCopy()

watchEffect(() => {
  document.documentElement.lang = locale.value
})

function toggleLocale() {
  preferences.locale = (locale.value === 'tr' ? 'en' : 'tr') as Locale
}

function logout() {
  admin.logout()
  void router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-shell">
    <header class="admin-header">
      <RouterLink class="brand" to="/" aria-label="Ent Challange ana sayfa">
        <BrandMark />
        <span>ent-challange</span>
      </RouterLink>
      <nav :aria-label="copy.admin.navigation">
        <template v-if="admin.isAuthenticated">
          <RouterLink :to="{ name: 'admin-requests' }">{{ copy.admin.requests }}</RouterLink>
          <button type="button" @click="logout">{{ copy.admin.logout }}</button>
        </template>
        <button type="button" @click="toggleLocale">{{ copy.nav.language }}</button>
      </nav>
    </header>
    <main id="admin-content" class="admin-main">
      <RouterView name="admin-view" />
    </main>
  </div>
</template>
