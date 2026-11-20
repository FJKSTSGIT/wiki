<script setup lang="ts">
const keys = ref([...API_KEYS])
const created = ref<string | null>(null)
const toast = useToast()
function create() {
  created.value = 'hk_live_' + Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14)
}
</script>

<template>
  <PageShell id="api-keys" title="APIキー" icon="i-lucide-key-round" description="外部連携用のキー">
    <template #actions>
      <UButton icon="i-lucide-plus" size="sm" label="キーを発行" @click="create" />
    </template>
    <UAlert v-if="created" color="success" variant="subtle" icon="i-lucide-key-round" title="新しいキーを発行しました（この画面でのみ表示）" class="mb-4" :close="true" @update:open="created = null">
      <template #description>
        <div class="flex items-center gap-2 mt-1">
          <code class="font-mono text-sm">{{ created }}</code>
          <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-copy" label="コピー" @click="toast.add({ title: 'コピーしました' })" />
        </div>
      </template>
    </UAlert>
    <div class="rounded-lg border border-default divide-y divide-default">
      <div v-for="k in keys" :key="k.id" class="flex items-center gap-4 px-4 py-3 text-sm">
        <UIcon name="i-lucide-key-round" class="size-5 text-dimmed" />
        <div class="w-56">
          <p class="text-highlighted">{{ k.name }}</p>
          <code class="text-xs text-muted">{{ k.prefix }}••••••••</code>
        </div>
        <div class="flex gap-1 flex-wrap w-64">
          <UBadge v-for="s in k.scopes" :key="s" color="neutral" variant="outline" size="sm" class="font-mono">{{ s }}</UBadge>
        </div>
        <div class="text-xs text-muted">
          <p>最終使用 {{ fmtDate(k.lastUsed) }}</p>
          <p>有効期限 <span :class="k.expires === '2026-11-30' && 'text-warning'">{{ k.expires }}</span></p>
        </div>
        <div class="ml-auto flex gap-1">
          <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-cw" label="ローテート" />
          <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash" label="失効" @click="keys = keys.filter(x => x !== k)" />
        </div>
      </div>
    </div>
  </PageShell>
</template>
