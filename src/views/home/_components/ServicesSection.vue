<script setup lang="ts">
import { useCopy } from '@/composables/useCopy'
import { usePreferencesStore } from '~store/preferences'

const { copy } = useCopy()
const preferences = usePreferencesStore()

function selectService(serviceId: string) {
  preferences.selectedService = serviceId
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="services" class="section services-section">
    <div class="container section-heading split-heading">
      <div>
        <p class="eyebrow eyebrow-dark"><span></span>{{ copy.services.eyebrow }}</p>
        <h2>{{ copy.services.title }}</h2>
      </div>
      <p>{{ copy.services.description }}</p>
    </div>
    <div class="container service-list">
      <article v-for="service in copy.services.items" :key="service.id" class="service-card">
        <span class="service-number">{{ service.number }}</span>
        <div class="service-copy">
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
          <ul aria-label="Kapsam">
            <li v-for="tag in service.tags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
        <button
          class="circle-button"
          type="button"
          :aria-label="`${copy.services.select}: ${service.title}`"
          @click="selectService(service.id)"
        >
          ↗
        </button>
      </article>
    </div>
  </section>
</template>
