<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import BrandMark from '~components/brand/BrandMark.vue'
import { useCopy } from '@/composables/useCopy'
import { useAdminStore } from '~store/admin'
import { useDeskStore } from '~store/desk'
import { usePreferencesStore, type Locale } from '~store/preferences'

const admin = useAdminStore()
const desk = useDeskStore()
const preferences = usePreferencesStore()
const router = useRouter()
const route = useRoute()
const { copy, locale } = useCopy()

watchEffect(() => {
  document.documentElement.lang = locale.value
})

function toggleLocale() {
  preferences.locale = (locale.value === 'tr' ? 'en' : 'tr') as Locale
}

function logout() {
  admin.logout()
  void desk.logout()
  void router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-shell">
    <header class="admin-header">
      <RouterLink class="brand" to="/" aria-label="Ent Challange ana sayfa">
        <BrandMark />
        <span>Enteksis</span>
      </RouterLink>
      <nav :aria-label="copy.admin.navigation">
        <template v-if="admin.isAuthenticated || desk.isAuthenticated">
          <RouterLink v-if="desk.isAuthenticated" :to="{ name: 'benim-masam' }">Benim Masam</RouterLink>
          <RouterLink v-if="admin.isAuthenticated" :to="{ name: 'admin-requests' }">{{ copy.admin.requests }}</RouterLink>
          <a href="/enteksis-urun-tanitimi.pdf" target="_blank" rel="noopener">Ürün PDF</a>
          <button type="button" @click="logout">{{ copy.admin.logout }}</button>
        </template>
        <button v-if="route.name !== 'benim-masam'" type="button" @click="toggleLocale">{{ copy.nav.language }}</button>
      </nav>
    </header>
    <main id="admin-content" class="admin-main">
      <RouterView name="admin-view" />
    </main>
  </div>
</template>
