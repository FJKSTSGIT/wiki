<script setup lang="ts">
defineProps<{ label: string, value: string, delta?: number, icon: string, hint?: string }>()
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-4' }">
    <div class="flex items-start justify-between">
      <p class="text-sm text-muted">{{ label }}</p>
      <UIcon :name="icon" class="size-5 text-dimmed" />
    </div>
    <p class="mt-2 text-2xl font-semibold tracking-tight text-highlighted tabular-nums">{{ value }}</p>
    <p class="mt-1 text-xs text-muted flex items-center gap-1">
      <template v-if="delta !== undefined">
        <UIcon :name="delta >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" :class="delta >= 0 ? 'text-success' : 'text-error'" class="size-3.5" />
        <span :class="delta >= 0 ? 'text-success' : 'text-error'">{{ delta >= 0 ? '+' : '' }}{{ delta }}%</span>
      </template>
      <span>{{ hint }}</span>
    </p>
  </UCard>
</template>
