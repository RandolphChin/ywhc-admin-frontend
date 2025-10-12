<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div class="error-code">404</div>

      <div class="text-h2 text-subtitle">
        {{ t('router.error.not_found') }}
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        :label="t('router.error.back_home')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped lang="scss">
.error-code {
  font-size: 30vh;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.text-subtitle {
  opacity: 0.7;
}
</style>
