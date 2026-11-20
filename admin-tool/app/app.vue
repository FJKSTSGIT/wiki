<script setup lang="ts">
import { ja } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="ja" :tooltip="{ delayDuration: 200 }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
