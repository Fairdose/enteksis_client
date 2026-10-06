<script setup lang="ts">
import { useCopy } from '@/composables/useCopy'
import HeroArtwork from './HeroArtwork.vue'

const { copy } = useCopy()
</script>

<template>
  <section class="hero-section">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow"><span></span>{{ copy.hero.eyebrow }}</p>
        <h1>
          {{ copy.hero.titleStart }}
          <em>{{ copy.hero.titleAccent }}</em>
          {{ copy.hero.titleEnd }}
        </h1>
        <p class="hero-description">{{ copy.hero.description }}</p>
        <div class="hero-actions">
          <a class="button" href="#contact">{{ copy.hero.primary }} <span>↗</span></a>
          <a class="text-link" href="#services">{{ copy.hero.secondary }} <span>↓</span></a>
        </div>
      </div>
      <HeroArtwork />
    </div>

    <div class="container metrics" aria-label="Çalışma ilkelerimiz">
      <p>{{ copy.hero.proof }}</p>
      <div class="metric">
        <strong>{{ copy.hero.metricOne }}</strong
        ><span>{{ copy.hero.metricOneLabel }}</span>
      </div>
      <div class="metric">
        <strong>{{ copy.hero.metricTwo }}</strong
        ><span>{{ copy.hero.metricTwoLabel }}</span>
      </div>
      <div class="metric">
        <strong>{{ copy.hero.metricThree }}</strong
        ><span>{{ copy.hero.metricThreeLabel }}</span>
      </div>
    </div>
  </section>
</template>
