<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useCopy } from '@/composables/useCopy'
import { useAdminStore, type RequestStatus } from '~store/admin'

const admin = useAdminStore()
const { copy, locale } = useCopy()
const search = ref('')
const statusFilter = ref<RequestStatus | 'all'>('all')

const serviceLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(copy.value.services.items.map((service) => [service.id, service.title])),
)
const statusLabels = computed<Record<RequestStatus, string>>(() => copy.value.admin.status)

const filteredRequests = computed(() => {
  const query = search.value.trim().toLocaleLowerCase(locale.value)
  return admin.requests.filter((request) => {
    if (statusFilter.value !== 'all' && request.status !== statusFilter.value) return false
    if (!query) return true
    return [request.name, request.email, serviceLabels.value[request.serviceType] || request.serviceType].some(
      (value) => value.toLocaleLowerCase(locale.value).includes(query),
    )
  })
})

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value === 'tr' ? 'tr-TR' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
)

onMounted(() => {
  void admin.loadRequests()
})
</script>

<template>
  <section class="admin-page" aria-labelledby="requests-title">
    <div class="admin-page-heading">
      <div>
        <p class="admin-kicker">{{ copy.admin.list.kicker }}</p>
        <h1 id="requests-title">{{ copy.admin.list.title }}</h1>
      </div>
      <span class="admin-count">{{ admin.requests.length }} {{ copy.admin.list.requestCount }}</span>
    </div>

    <div class="admin-filters">
      <label class="admin-search">
        <span>{{ copy.admin.list.search }}</span>
        <input v-model="search" type="search" :placeholder="copy.admin.list.searchPlaceholder" />
      </label>
      <label class="admin-search">
        <span>{{ copy.admin.list.status }}</span>
        <select v-model="statusFilter">
          <option value="all">{{ copy.admin.list.allStatuses }}</option>
          <option value="new">{{ copy.admin.status.new }}</option>
          <option value="read">{{ copy.admin.status.read }}</option>
          <option value="replied">{{ copy.admin.status.replied }}</option>
        </select>
      </label>
    </div>

    <div v-if="admin.listState === 'loading'" class="admin-panel admin-state" role="status">
      {{ copy.admin.list.loading }}
    </div>
    <div v-else-if="admin.listState === 'error'" class="admin-panel admin-state">
      <p class="admin-alert" role="alert">{{ admin.error }}</p>
      <button class="admin-secondary-button" type="button" @click="admin.loadRequests">
        {{ copy.admin.list.retry }}
      </button>
    </div>
    <div v-else-if="filteredRequests.length === 0" class="admin-panel admin-state">
      {{ search ? copy.admin.list.noResults : copy.admin.list.empty }}
    </div>
    <div v-else class="admin-request-list">
      <RouterLink
        v-for="request in filteredRequests"
        :key="request.id"
        class="admin-request-row"
        :to="{ name: 'admin-request-detail', params: { id: request.id } }"
      >
        <div>
          <span class="admin-request-name">
            <strong>{{ request.name }}</strong>
            <span class="admin-status" :data-status="request.status">{{ statusLabels[request.status] }}</span>
          </span>
          <span>{{ request.email }}</span>
        </div>
        <span class="admin-service">{{ serviceLabels[request.serviceType] || request.serviceType }}</span>
        <time :datetime="request.createdAt">{{ dateFormatter.format(new Date(request.createdAt)) }}</time>
        <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </section>
</template>
