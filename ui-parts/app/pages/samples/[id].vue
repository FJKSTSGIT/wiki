<script setup lang="ts">
import { PERMISSIONS } from '~/utils/access'

const route = useRoute()
const { can, role } = useAccess()
const screen = computed(() => SAMPLE_SCREENS[route.params.id as keyof typeof SAMPLE_SCREENS])
useHead({ title: () => screen.value?.label ?? 'サンプル' })
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center">
    <UEmpty
      v-if="!screen"
      icon="i-lucide-circle-help"
      title="画面が見つかりません"
      :actions="[{ label: 'はじめにへ', to: '/' }]"
    />
    <UEmpty
      v-else-if="!can(screen.permission)"
      icon="i-lucide-shield-x"
      title="この画面を表示する権限がありません"
      :description="`必要な権限：${PERMISSIONS[screen.permission]}（現在の役割：${role.label}）`"
      :actions="[{ label: '権限による表示切替を見る', to: '/parts/access', icon: 'i-lucide-arrow-right' }]"
    />
    <UEmpty
      v-else
      icon="i-lucide-check-circle-2"
      :title="`「${screen.label}」画面（サンプル）`"
      :description="`役割「${role.label}」は「${PERMISSIONS[screen.permission]}」権限を持っているため、この画面とメニューが表示されています。`"
    />
  </div>
</template>
