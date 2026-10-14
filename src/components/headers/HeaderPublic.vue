<script setup lang="ts">
import { ref } from 'vue'

import BrandMark from '~components/brand/BrandMark.vue'
import LanguageSelector from '~components/controls/LanguageSelector.vue'
import { useCopy } from '@/composables/useCopy'

const { copy } = useCopy()
const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#top" aria-label="ent-challange ana sayfa" @click="closeMenu">
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
        <a href="/ent-challange-urun-tanitimi.pdf" target="_blank" rel="noopener" @click="closeMenu"
          >Ürün PDF</a
        >
        <LanguageSelector @change="closeMenu" />
        <a class="button button-small" href="#contact" @click="closeMenu">{{ copy.nav.cta }}</a>
      </nav>
    </div>
  </header>
</template>
