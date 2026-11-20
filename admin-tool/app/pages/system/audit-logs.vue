<script setup lang="ts">
const q = ref('')
const result = ref('all')
const expanded = ref<number | null>(null)
const rows = computed(() => AUDIT_LOGS.filter(l => (result.value === 'all' || l.result === result.value) && (!q.value || [l.actor, l.action, l.target, l.ip].some(s => s.includes(q.value)))))
</script>

<template>
  <PageShell id="audit-logs" title="監査ログ" icon="i-lucide-scroll-text" description="管理操作の記録（90日保持）">
    <template #actions>
      <UButton icon="i-lucide-download" color="neutral" variant="outline" size="sm" label="JSONL" />
    </template>
    <template #toolbar>
      <div class="flex items-center gap-2">
        <UInput v-model="q" icon="i-lucide-search" placeholder="actor / action / target / ip" size="sm" class="w-80 font-mono" />
        <USelect v-model="result" size="sm" class="w-32" :items="[{ label: 'すべて', value: 'all' }, { label: '成功', value: 'success' }, { label: '失敗', value: 'failure' }]" />
      </div>
    </template>
    <div class="rounded-lg border border-default font-mono text-xs divide-y divide-default">
      <template v-for="l in rows" :key="l.id">
        <button class="w-full grid grid-cols-[150px_20px_130px_150px_1fr_110px] gap-3 items-center px-4 py-2 text-left hover:bg-elevated/50" @click="expanded = expanded === l.id ? null : l.id">
          <span class="text-muted">{{ fmtDate(l.at) }}</span>
          <UIcon :name="l.result === 'success' ? 'i-lucide-check' : 'i-lucide-x'" :class="l.result === 'success' ? 'text-success' : 'text-error'" class="size-3.5" />
          <span class="font-sans text-sm truncate">{{ l.actor }}</span>
          <span class="text-primary">{{ l.action }}</span>
          <span class="text-muted truncate">{{ l.target }}</span>
          <span class="text-dimmed text-right">{{ l.ip }}</span>
        </button>
        <pre v-if="expanded === l.id" class="px-4 py-3 bg-muted text-muted overflow-x-auto">{{ JSON.stringify({ ...l, userAgent: 'Mozilla/5.0 (Macintosh)', requestId: `req_${l.id.toString(36)}` }, null, 2) }}</pre>
      </template>
    </div>
  </PageShell>
</template>
