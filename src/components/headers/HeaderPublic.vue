<script setup lang="ts">
import { ref } from 'vue'

import BrandMark from '~components/brand/BrandMark.vue'
import { useCopy } from '@/composables/useCopy'
import { usePreferencesStore, type Locale } from '~store/preferences'

const { copy, locale } = useCopy()
const preferences = usePreferencesStore()
const menuOpen = ref(false)

function toggleLocale() {
  preferences.locale = (locale.value === 'tr' ? 'en' : 'tr') as Locale
  menuOpen.value = false
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#top" aria-label="Ent Challange ana sayfa" @click="closeMenu">
        <BrandMark />
        <span>ent-challange</span>
      </a>

      <button
        class="menu-button"
        type="button"
        :aria-label="copy.nav.menu"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span>
      </button>

      <nav
        id="primary-navigation"
        class="main-nav"
        :class="{ open: menuOpen }"
        aria-label="Ana menü"
      >
        <a href="#services" @click="closeMenu">{{ copy.nav.services }}</a>
        <a href="#process" @click="closeMenu">{{ copy.nav.process }}</a>
        <a href="#contact" @click="closeMenu">{{ copy.nav.contact }}</a>
        <button class="language-button" type="button" @click="toggleLocale">
          {{ copy.nav.language }}
        </button>
        <a class="button button-small" href="#contact" @click="closeMenu">{{ copy.nav.cta }}</a>
      </nav>
    </div>
  </header>
</template>
