<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAdminStore } from '~store/admin'

const admin = useAdminStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const submitting = ref(false)

async function submit() {
  submitting.value = true
  const authenticated = await admin.login(email.value, password.value)
  submitting.value = false
  if (authenticated) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
    await router.replace(redirect || { name: 'admin-requests' })
  }
}
</script>

<template>
  <section class="admin-login" aria-labelledby="admin-login-title">
    <div class="admin-login-copy">
      <p class="admin-kicker">Yönetim alanı</p>
      <h1 id="admin-login-title">Hizmet taleplerini yönetin.</h1>
      <p>Bu alan yalnızca yetkili ekip üyeleri içindir.</p>
    </div>
    <form class="admin-panel admin-login-form" @submit.prevent="submit">
      <div class="field-group">
        <label for="admin-email">E-posta</label>
        <input
          id="admin-email"
          v-model="email"
          name="username"
          type="email"
          autocomplete="username"
          required
        />
      </div>
      <div class="field-group">
        <label for="admin-password">Şifre</label>
        <input
          id="admin-password"
          v-model="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="admin.error" class="admin-alert" role="alert">{{ admin.error }}</p>
      <button class="button" type="submit" :disabled="submitting">
        {{ submitting ? 'Kontrol ediliyor…' : 'Giriş yap' }}
      </button>
    </form>
  </section>
</template>
