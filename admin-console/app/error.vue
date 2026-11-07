<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <UApp>
    <div class="flex min-h-screen items-center justify-center p-6">
      <UEmpty
        icon="i-lucide-circle-alert"
        :title="error.statusCode === 404 ? 'ページが見つかりません' : 'エラーが発生しました'"
        :description="error.statusMessage || error.message"
        :actions="[{ label: 'トップへ戻る', icon: 'i-lucide-house', onClick: () => clearError({ redirect: '/' }) }]"
        size="lg"
      />
    </div>
  </UApp>
</template>
