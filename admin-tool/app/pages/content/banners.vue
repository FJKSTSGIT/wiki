<script setup lang="ts">
const list = ref(BANNERS.map(b => ({ ...b })))
</script>

<template>
  <PageShell id="banners" title="バナー" icon="i-lucide-image" description="掲載枠ごとのバナー管理">
    <template #actions>
      <UButton icon="i-lucide-plus" size="sm" label="バナー追加" />
    </template>
    <div class="grid grid-cols-2 gap-4">
      <UCard v-for="b in list" :key="b.id" :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
        <div class="h-32 bg-gradient-to-br flex items-center justify-center" :class="b.hue">
          <p class="text-2xl font-bold tracking-wider text-white/90">{{ b.title }}</p>
        </div>
        <div class="p-4 flex items-center gap-4">
          <div class="min-w-0">
            <p class="text-highlighted font-medium">{{ b.title }}</p>
            <p class="text-xs text-muted">{{ b.placement }} · {{ b.period }}</p>
          </div>
          <div class="ml-auto text-right text-xs text-muted">
            <p><span class="text-highlighted tabular-nums">{{ b.clicks.toLocaleString() }}</span> clicks</p>
            <p>CTR <span class="text-highlighted tabular-nums">{{ b.ctr }}%</span></p>
          </div>
          <USwitch v-model="b.active" />
        </div>
      </UCard>
    </div>
  </PageShell>
</template>
