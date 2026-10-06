<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterView } from 'vue-router'

import FooterPublic from '~components/footers/FooterPublic.vue'
import HeaderPublic from '~components/headers/HeaderPublic.vue'
import { useCopy } from '@/composables/useCopy'

const { locale } = useCopy()

watchEffect(() => {
  document.documentElement.lang = locale.value
})
</script>

<template>
  <div id="top" class="layout-public">
    <a class="skip-link" href="#main-content">Ana içeriğe geç</a>
    <HeaderPublic />
    <main id="main-content">
      <RouterView name="public-view" />
    </main>
    <FooterPublic />
  </div>
</template>
