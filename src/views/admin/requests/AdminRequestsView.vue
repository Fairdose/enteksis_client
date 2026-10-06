<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useAdminStore } from '~store/admin'

const admin = useAdminStore()
const search = ref('')

const serviceLabels: Record<string, string> = {
  'web-design': 'Web tasarım',
  'software-development': 'Yazılım geliştirme',
  'digital-consulting': 'Dijital danışmanlık',
  'support-maintenance': 'Destek ve bakım',
}

const filteredRequests = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('tr')
  if (!query) return admin.requests
  return admin.requests.filter((request) =>
    [request.name, request.email, serviceLabels[request.serviceType] || request.serviceType].some(
      (value) => value.toLocaleLowerCase('tr').includes(query),
    ),
  )
})

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

onMounted(() => {
  void admin.loadRequests()
})
</script>

<template>
  <section class="admin-page" aria-labelledby="requests-title">
    <div class="admin-page-heading">
      <div>
        <p class="admin-kicker">Gelen kutusu</p>
        <h1 id="requests-title">Hizmet talepleri</h1>
      </div>
      <span class="admin-count">{{ admin.requests.length }} talep</span>
    </div>

    <label class="admin-search">
      <span>Talep ara</span>
      <input v-model="search" type="search" placeholder="İsim, e-posta veya hizmet" />
    </label>

    <div v-if="admin.listState === 'loading'" class="admin-panel admin-state" role="status">
      Talepler yükleniyor…
    </div>
    <div v-else-if="admin.listState === 'error'" class="admin-panel admin-state">
      <p class="admin-alert" role="alert">{{ admin.error }}</p>
      <button class="admin-secondary-button" type="button" @click="admin.loadRequests">
        Tekrar dene
      </button>
    </div>
    <div v-else-if="filteredRequests.length === 0" class="admin-panel admin-state">
      {{ search ? 'Aramanızla eşleşen talep bulunamadı.' : 'Henüz hizmet talebi bulunmuyor.' }}
    </div>
    <div v-else class="admin-request-list">
      <RouterLink
        v-for="request in filteredRequests"
        :key="request.id"
        class="admin-request-row"
        :to="{ name: 'admin-request-detail', params: { id: request.id } }"
      >
        <div>
          <strong>{{ request.name }}</strong>
          <span>{{ request.email }}</span>
        </div>
        <span class="admin-service">{{ serviceLabels[request.serviceType] || request.serviceType }}</span>
        <time :datetime="request.createdAt">{{ dateFormatter.format(new Date(request.createdAt)) }}</time>
        <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </section>
</template>
