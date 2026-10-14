<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import BrandMark from '~components/brand/BrandMark.vue'
import LanguageSelector from '~components/controls/LanguageSelector.vue'
import { useCopy } from '@/composables/useCopy'
import { useAdminStore } from '~store/admin'
import { useDeskStore } from '~store/desk'

const admin = useAdminStore()
const desk = useDeskStore()
const router = useRouter()
const route = useRoute()
const { copy, locale } = useCopy()

watchEffect(() => {
  document.documentElement.lang = locale.value
})

function logout() {
  admin.logout()
  void desk.logout()
  void router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-shell">
    <header class="admin-header">
      <RouterLink class="brand" to="/" aria-label="ent-challange ana sayfa">
        <BrandMark />
        <span>ent-challange</span>
      </RouterLink>
      <nav :aria-label="copy.admin.navigation">
        <template v-if="admin.isAuthenticated || desk.isAuthenticated">
          <RouterLink v-if="desk.isAuthenticated" :to="{ name: 'benim-masam' }"
            >Benim Masam</RouterLink
          >
          <RouterLink v-if="admin.isAuthenticated" :to="{ name: 'admin-requests' }">{{
            copy.admin.requests
          }}</RouterLink>
          <a href="/enteksis-urun-tanitimi.pdf" target="_blank" rel="noopener">Ürün PDF</a>
          <button type="button" @click="logout">{{ copy.admin.logout }}</button>
        </template>
        <LanguageSelector v-if="route.name !== 'benim-masam'" tone="light" />
      </nav>
    </header>
    <main id="admin-content" class="admin-main">
      <RouterView name="admin-view" />
    </main>
  </div>
</template>
