<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCopy } from '@/composables/useCopy'
import { useAdminStore, type RequestStatus } from '~store/admin'

const admin = useAdminStore()
const { copy, locale } = useCopy()
const route = useRoute()
const router = useRouter()
const subject = ref('')
const message = ref('')
const mutationPending = ref(false)
const mutationError = ref('')

const serviceLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(copy.value.services.items.map((service) => [service.id, service.title])),
)
const statusLabels = computed<Record<RequestStatus, string>>(() => copy.value.admin.status)
const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value === 'tr' ? 'tr-TR' : 'en-GB', {
      dateStyle: 'long',
      timeStyle: 'short',
    }),
)

const mailtoHref = computed(() => {
  const request = admin.currentRequest
  if (!request || !subject.value.trim() || !message.value.trim()) return undefined
  return `mailto:${request.email}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(message.value)}`
})

async function setStatus(status: RequestStatus) {
  const request = admin.currentRequest
  if (!request || request.status === status) return
  mutationPending.value = true
  mutationError.value = ''
  try {
    await admin.updateRequestStatus(request.id, status)
  } catch (error) {
    mutationError.value =
      error instanceof Error ? error.message : copy.value.admin.detail.statusError
  } finally {
    mutationPending.value = false
  }
}

async function deleteRequest() {
  const request = admin.currentRequest
  if (!request || !window.confirm(copy.value.admin.detail.deleteConfirm)) return
  mutationPending.value = true
  mutationError.value = ''
  try {
    await admin.deleteRequest(request.id)
    await router.push({ name: 'admin-requests' })
  } catch (error) {
    mutationError.value = error instanceof Error ? error.message : copy.value.admin.detail.deleteError
    mutationPending.value = false
  }
}

watch(
  () => String(route.params.id || ''),
  async (id) => {
    if (!id || !(await admin.loadRequest(id)) || !admin.currentRequest) return
    const service = serviceLabels.value[admin.currentRequest.serviceType] || admin.currentRequest.serviceType
    subject.value = copy.value.admin.detail.mailSubject.replace('{service}', service)
    message.value = `${copy.value.admin.detail.mailGreeting.replace('{name}', admin.currentRequest.name)}\n\n${copy.value.admin.detail.mailThanks}\n\n\n\n${copy.value.admin.detail.mailClosing}\nEnt Challange`
    if (admin.currentRequest.status === 'new') await setStatus('read')
  },
  { immediate: true },
)
</script>

<template>
  <section class="admin-page" aria-labelledby="request-title">
    <RouterLink class="admin-back-link" :to="{ name: 'admin-requests' }">
      ← {{ copy.admin.detail.back }}
    </RouterLink>

    <div v-if="admin.detailState === 'loading'" class="admin-panel admin-state" role="status">
      {{ copy.admin.detail.loading }}
    </div>
    <div v-else-if="admin.detailState === 'error'" class="admin-panel admin-state">
      <p class="admin-alert" role="alert">{{ admin.error }}</p>
    </div>
    <template v-else-if="admin.currentRequest">
      <div class="admin-page-heading admin-detail-heading">
        <div>
          <p class="admin-kicker">{{ copy.admin.detail.kicker }}</p>
          <h1 id="request-title">{{ admin.currentRequest.name }}</h1>
          <a :href="`mailto:${admin.currentRequest.email}`">{{ admin.currentRequest.email }}</a>
        </div>
        <time :datetime="admin.currentRequest.createdAt">
          {{ dateFormatter.format(new Date(admin.currentRequest.createdAt)) }}
        </time>
      </div>

      <div class="admin-lifecycle" :aria-label="copy.admin.detail.actions">
        <span class="admin-status" :data-status="admin.currentRequest.status">
          {{ statusLabels[admin.currentRequest.status] }}
        </span>
        <button
          class="admin-secondary-button"
          type="button"
          :disabled="mutationPending || admin.currentRequest.status === 'new'"
          @click="setStatus('new')"
        >
          {{ copy.admin.detail.markNew }}
        </button>
        <button
          class="admin-secondary-button"
          type="button"
          :disabled="mutationPending || admin.currentRequest.status === 'read'"
          @click="setStatus('read')"
        >
          {{ copy.admin.detail.markRead }}
        </button>
        <button class="admin-danger-button" type="button" :disabled="mutationPending" @click="deleteRequest">
          {{ copy.admin.detail.delete }}
        </button>
      </div>
      <p v-if="mutationError" class="admin-alert" role="alert">{{ mutationError }}</p>

      <div class="admin-detail-grid">
        <article class="admin-panel admin-request-detail">
          <span>{{ copy.admin.detail.service }}</span>
          <strong>{{ serviceLabels[admin.currentRequest.serviceType] || admin.currentRequest.serviceType }}</strong>
          <span>{{ copy.admin.detail.description }}</span>
          <p>{{ admin.currentRequest.description }}</p>
        </article>

        <form class="admin-panel admin-reply-form" @submit.prevent>
          <div>
            <p class="admin-kicker">{{ copy.admin.detail.replyKicker }}</p>
            <h2>{{ copy.admin.detail.replyTitle }}</h2>
            <p>{{ copy.admin.detail.replyDescription }}</p>
          </div>
          <div class="field-group">
            <label for="reply-subject">{{ copy.admin.detail.subject }}</label>
            <input id="reply-subject" v-model="subject" maxlength="160" required />
          </div>
          <div class="field-group">
            <label for="reply-message">{{ copy.admin.detail.message }}</label>
            <textarea id="reply-message" v-model="message" rows="10" maxlength="5000" required></textarea>
          </div>
          <a
            class="button"
            :class="{ disabled: !mailtoHref }"
            :href="mailtoHref"
            :aria-disabled="!mailtoHref"
          >
            {{ copy.admin.detail.openEmail }}
          </a>
          <button
            class="admin-secondary-button admin-replied-button"
            type="button"
            :disabled="mutationPending || admin.currentRequest.status === 'replied'"
            @click="setStatus('replied')"
          >
            {{ copy.admin.detail.markReplied }}
          </button>
        </form>
      </div>
    </template>
  </section>
</template>
