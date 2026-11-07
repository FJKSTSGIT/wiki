<script setup lang="ts">
/**
 * 画面の共通枠（UDashboardPanel + ヘッダー）
 * すべての画面はこのコンポーネントで包むことで、ヘッダーの見た目・操作を統一する。
 */
withDefaults(defineProps<{
  id: string
  title: string
  description?: string
  /** 本文の最大幅を制限する（詳細画面など） */
  narrow?: boolean
}>(), { narrow: false })

const slots = defineSlots<{
  'default'(): any
  'actions'?(): any
  'toolbar'?(): any
  'toolbar-right'?(): any
  'leading'?(): any
}>()
</script>

<template>
  <UDashboardPanel :id="id">
    <template #header>
      <UDashboardNavbar :title="title" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <slot name="leading" />
        </template>

        <template #right>
          <slot name="actions" />
          <AppHeaderTools />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar v-if="slots.toolbar || slots['toolbar-right']">
        <template #left>
          <slot name="toolbar" />
        </template>
        <template #right>
          <slot name="toolbar-right" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div :class="narrow ? 'mx-auto w-full max-w-5xl' : 'w-full'" class="flex flex-1 flex-col gap-4 sm:gap-6">
        <p v-if="description" class="-mb-2 text-sm text-muted">
          {{ description }}
        </p>
        <slot />
      </div>
    </template>
  </UDashboardPanel>
</template>
