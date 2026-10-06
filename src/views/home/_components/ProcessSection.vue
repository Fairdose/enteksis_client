<script setup lang="ts">
import { useCopy } from '@/composables/useCopy'

const { copy } = useCopy()
</script>

<template>
  <section id="process" class="section process-section">
    <div class="container process-grid">
      <div class="process-intro">
        <p class="eyebrow"><span></span>{{ copy.process.eyebrow }}</p>
        <h2>{{ copy.process.title }}</h2>
        <div class="process-shape" aria-hidden="true"><span></span></div>
      </div>
      <ol class="process-list">
        <li v-for="step in copy.process.steps" :key="step.number">
          <span>{{ step.number }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
