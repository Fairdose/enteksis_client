<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAdminStore, type RequestStatus } from '~store/admin'

const admin = useAdminStore()
const route = useRoute()
const router = useRouter()
const subject = ref('')
const message = ref('')
const mutationPending = ref(false)
const mutationError = ref('')

const serviceLabels: Record<string, string> = {
  'web-design': 'Web tasarım',
  'software-development': 'Yazılım geliştirme',
  'digital-consulting': 'Dijital danışmanlık',
  'support-maintenance': 'Destek ve bakım',
}

const statusLabels: Record<RequestStatus, string> = {
  new: 'Yeni',
  read: 'Okundu',
  replied: 'Cevaplandı',
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

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
    mutationError.value = error instanceof Error ? error.message : 'Talep durumu güncellenemedi.'
  } finally {
    mutationPending.value = false
  }
}

async function deleteRequest() {
  const request = admin.currentRequest
  if (!request || !window.confirm('Bu talep kalıcı olarak silinsin mi?')) return
  mutationPending.value = true
  mutationError.value = ''
  try {
    await admin.deleteRequest(request.id)
    await router.push({ name: 'admin-requests' })
  } catch (error) {
    mutationError.value = error instanceof Error ? error.message : 'Talep silinemedi.'
    mutationPending.value = false
  }
}

watch(
  () => String(route.params.id || ''),
  async (id) => {
    if (!id || !(await admin.loadRequest(id)) || !admin.currentRequest) return
    subject.value = `Ent Challange | ${serviceLabels[admin.currentRequest.serviceType] || 'Hizmet'} talebiniz`
    message.value = `Merhaba ${admin.currentRequest.name},\n\nTalebiniz için teşekkür ederiz.\n\n\n\nİyi çalışmalar,\nEnt Challange`
    if (admin.currentRequest.status === 'new') await setStatus('read')
  },
  { immediate: true },
)
</script>

<template>
  <section class="admin-page" aria-labelledby="request-title">
    <RouterLink class="admin-back-link" :to="{ name: 'admin-requests' }">← Tüm talepler</RouterLink>

    <div v-if="admin.detailState === 'loading'" class="admin-panel admin-state" role="status">
      Talep yükleniyor…
    </div>
    <div v-else-if="admin.detailState === 'error'" class="admin-panel admin-state">
      <p class="admin-alert" role="alert">{{ admin.error }}</p>
    </div>
    <template v-else-if="admin.currentRequest">
      <div class="admin-page-heading admin-detail-heading">
        <div>
          <p class="admin-kicker">Talep detayı</p>
          <h1 id="request-title">{{ admin.currentRequest.name }}</h1>
          <a :href="`mailto:${admin.currentRequest.email}`">{{ admin.currentRequest.email }}</a>
        </div>
        <time :datetime="admin.currentRequest.createdAt">
          {{ dateFormatter.format(new Date(admin.currentRequest.createdAt)) }}
        </time>
      </div>

      <div class="admin-lifecycle" aria-label="Talep işlemleri">
        <span class="admin-status" :data-status="admin.currentRequest.status">
          {{ statusLabels[admin.currentRequest.status] }}
        </span>
        <button
          class="admin-secondary-button"
          type="button"
          :disabled="mutationPending || admin.currentRequest.status === 'new'"
          @click="setStatus('new')"
        >
          Yeni olarak işaretle
        </button>
        <button
          class="admin-secondary-button"
          type="button"
          :disabled="mutationPending || admin.currentRequest.status === 'read'"
          @click="setStatus('read')"
        >
          Okundu olarak işaretle
        </button>
        <button class="admin-danger-button" type="button" :disabled="mutationPending" @click="deleteRequest">
          Talebi sil
        </button>
      </div>
      <p v-if="mutationError" class="admin-alert" role="alert">{{ mutationError }}</p>

      <div class="admin-detail-grid">
        <article class="admin-panel admin-request-detail">
          <span>İlgilenilen hizmet</span>
          <strong>{{ serviceLabels[admin.currentRequest.serviceType] || admin.currentRequest.serviceType }}</strong>
          <span>Talep açıklaması</span>
          <p>{{ admin.currentRequest.description }}</p>
        </article>

        <form class="admin-panel admin-reply-form" @submit.prevent>
          <div>
            <p class="admin-kicker">E-posta yanıtı</p>
            <h2>Yanıtınızı hazırlayın</h2>
            <p>Bağlantı, cihazınızdaki varsayılan e-posta uygulamasını açar.</p>
          </div>
          <div class="field-group">
            <label for="reply-subject">Konu</label>
            <input id="reply-subject" v-model="subject" maxlength="160" required />
          </div>
          <div class="field-group">
            <label for="reply-message">Mesaj</label>
            <textarea id="reply-message" v-model="message" rows="10" maxlength="5000" required></textarea>
          </div>
          <a
            class="button"
            :class="{ disabled: !mailtoHref }"
            :href="mailtoHref"
            :aria-disabled="!mailtoHref"
          >
            E-posta uygulamasını aç
          </a>
          <button
            class="admin-secondary-button admin-replied-button"
            type="button"
            :disabled="mutationPending || admin.currentRequest.status === 'replied'"
            @click="setStatus('replied')"
          >
            Cevaplandı olarak işaretle
          </button>
        </form>
      </div>
    </template>
  </section>
</template>
