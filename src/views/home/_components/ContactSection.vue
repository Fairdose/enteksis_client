<script setup lang="ts">
import { useCopy } from '@/composables/useCopy'
import LeadForm from './LeadForm.vue'

const { copy } = useCopy()
</script>

<template>
  <section id="contact" class="section contact-section">
    <div class="container contact-grid">
      <div class="contact-copy">
        <p class="eyebrow eyebrow-dark"><span></span>{{ copy.form.eyebrow }}</p>
        <h2>{{ copy.form.title }}</h2>
        <p>{{ copy.form.description }}</p>
        <a href="mailto:hello@fairdose.net">hello@fairdose.net</a>
      </div>
      <LeadForm />
    </div>
  </section>
</template>
