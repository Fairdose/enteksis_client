<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'

import BrandMark from '~components/brand/BrandMark.vue'
import { useAdminStore } from '~store/admin'

const admin = useAdminStore()
const router = useRouter()

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
      <nav v-if="admin.isAuthenticated" aria-label="Yönetim menüsü">
        <RouterLink :to="{ name: 'admin-requests' }">Talepler</RouterLink>
        <button type="button" @click="logout">Çıkış yap</button>
      </nav>
    </header>
    <main id="admin-content" class="admin-main">
      <RouterView name="admin-view" />
    </main>
  </div>
</template>
