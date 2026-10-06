<script setup lang="ts">
import BrandMark from '~components/brand/BrandMark.vue'
import { useCopy } from '@/composables/useCopy'

const { copy } = useCopy()
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <a class="brand brand-light" href="#top" aria-label="Ent Challange ana sayfa">
          <BrandMark />
          <span>ent-challange</span>
        </a>
        <p>{{ copy.footer.statement }}</p>
      </div>
      <div class="footer-column">
        <strong>{{ copy.footer.navigation }}</strong>
        <a href="#services">{{ copy.nav.services }}</a>
        <a href="#process">{{ copy.nav.process }}</a>
        <a href="#contact">{{ copy.nav.contact }}</a>
      </div>
      <div class="footer-column">
        <strong>{{ copy.footer.contact }}</strong>
        <a href="mailto:hello@fairdose.net">hello@fairdose.net</a>
        <span>İstanbul, Türkiye</span>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© {{ new Date().getFullYear() }} Ent Challange. {{ copy.footer.rights }}</span>
      <span>Design · Development · Strategy</span>
    </div>
  </footer>
</template>
