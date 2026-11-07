<script setup lang="ts">
/** ラベル・値の一覧表示（詳細パネル用） */
defineProps<{ items: { label: string, value?: string | number | null }[] }>()
</script>

<template>
  <dl class="divide-y divide-default rounded-lg border border-default text-sm">
    <div v-for="item in items" :key="item.label" class="grid grid-cols-[8rem_1fr] gap-3 px-4 py-2.5">
      <dt class="text-muted">
        {{ item.label }}
      </dt>
      <dd class="min-w-0 break-words text-highlighted tabular-nums">
        {{ item.value ?? '—' }}
      </dd>
    </div>
  </dl>
</template>
