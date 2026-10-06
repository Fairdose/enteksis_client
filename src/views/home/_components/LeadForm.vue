<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { useCopy } from '@/composables/useCopy'
import { usePreferencesStore } from '~store/preferences'

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'
type FieldName = 'name' | 'email' | 'serviceType' | 'description'

interface FormValues {
  name: string
  email: string
  serviceType: string
  description: string
}

const { copy } = useCopy()
const preferences = usePreferencesStore()
const form = reactive<FormValues>({
  name: '',
  email: '',
  serviceType: preferences.selectedService,
  description: '',
})
const errors = reactive<Partial<Record<FieldName, string>>>({})
const state = ref<SubmissionState>('idle')
const serverMessage = ref('')
const formElement = ref<HTMLFormElement>()
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

const descriptionLength = computed(() => [...form.description].length)

function validate(): boolean {
  clearErrors()
  if ([...form.name.trim()].length < 2) errors.name = copy.value.form.validation.name
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = copy.value.form.validation.email
  }
  if (!form.serviceType) errors.serviceType = copy.value.form.validation.service
  if ([...form.description.trim()].length < 10) {
    errors.description = copy.value.form.validation.details
  }
  return Object.keys(errors).length === 0
}

function clearErrors() {
  for (const key of Object.keys(errors) as FieldName[]) delete errors[key]
}

async function submit() {
  serverMessage.value = ''
  if (!validate()) {
    await nextTick()
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  state.value = 'submitting'
  preferences.selectedService = form.serviceType
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const body = (await response.json().catch(() => ({}))) as {
      error?: string
      fields?: Partial<Record<FieldName, string>>
    }

    if (!response.ok) {
      if (body.fields) Object.assign(errors, body.fields)
      throw new Error(body.error || copy.value.form.genericError)
    }

    state.value = 'success'
    form.name = ''
    form.email = ''
    form.description = ''
  } catch (error) {
    state.value = 'error'
    serverMessage.value = error instanceof Error ? error.message : copy.value.form.genericError
  }
}

function reset() {
  state.value = 'idle'
  serverMessage.value = ''
  clearErrors()
}
</script>

<template>
  <div class="form-panel">
    <div v-if="state === 'success'" class="success-state" role="status" tabindex="-1">
      <span class="success-icon" aria-hidden="true">✓</span>
      <h3>{{ copy.form.successTitle }}</h3>
      <p>{{ copy.form.successDescription }}</p>
      <button class="text-button" type="button" @click="reset">
        {{ copy.form.sendAnother }} →
      </button>
    </div>

    <form v-else ref="formElement" novalidate @submit.prevent="submit">
      <div class="form-grid">
        <div class="field-group">
          <label for="name">{{ copy.form.name }}</label>
          <input
            id="name"
            v-model="form.name"
            name="name"
            type="text"
            autocomplete="name"
            maxlength="100"
            :placeholder="copy.form.namePlaceholder"
            :aria-invalid="Boolean(errors.name)"
            :aria-describedby="errors.name ? 'name-error' : undefined"
          />
          <span v-if="errors.name" id="name-error" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="field-group">
          <label for="email">{{ copy.form.email }}</label>
          <input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            maxlength="254"
            :placeholder="copy.form.emailPlaceholder"
            :aria-invalid="Boolean(errors.email)"
            :aria-describedby="errors.email ? 'email-error' : undefined"
          />
          <span v-if="errors.email" id="email-error" class="field-error">{{ errors.email }}</span>
        </div>
      </div>

      <div class="field-group">
        <label for="service">{{ copy.form.service }}</label>
        <select
          id="service"
          v-model="form.serviceType"
          name="serviceType"
          :aria-invalid="Boolean(errors.serviceType)"
          :aria-describedby="errors.serviceType ? 'service-error' : undefined"
        >
          <option value="" disabled>{{ copy.form.servicePlaceholder }}</option>
          <option v-for="service in copy.services.items" :key="service.id" :value="service.id">
            {{ service.title }}
          </option>
        </select>
        <span v-if="errors.serviceType" id="service-error" class="field-error">{{
          errors.serviceType
        }}</span>
      </div>

      <div class="field-group">
        <div class="label-row">
          <label for="description">{{ copy.form.details }}</label>
          <span>{{ descriptionLength }} / 2000 {{ copy.form.characters }}</span>
        </div>
        <textarea
          id="description"
          v-model="form.description"
          name="description"
          rows="5"
          maxlength="2000"
          :placeholder="copy.form.detailsPlaceholder"
          :aria-invalid="Boolean(errors.description)"
          :aria-describedby="errors.description ? 'description-error' : undefined"
        ></textarea>
        <span v-if="errors.description" id="description-error" class="field-error">
          {{ errors.description }}
        </span>
      </div>

      <div v-if="state === 'error'" class="form-error" role="alert">
        <span aria-hidden="true">!</span>
        {{ serverMessage || copy.form.genericError }}
      </div>

      <div class="form-footer">
        <button class="button submit-button" type="submit" :disabled="state === 'submitting'">
          <span v-if="state === 'submitting'" class="spinner" aria-hidden="true"></span>
          {{ state === 'submitting' ? copy.form.submitting : copy.form.submit }}
        </button>
        <p>{{ copy.form.privacy }}</p>
      </div>
    </form>
  </div>
</template>
