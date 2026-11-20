<script setup lang="ts">
const ST = { success: { label: '成功', color: 'success', icon: 'i-lucide-circle-check' }, failed: { label: '失敗', color: 'error', icon: 'i-lucide-circle-x' }, running: { label: '実行中', color: 'info', icon: 'i-lucide-loader-circle' } } as const
const toast = useToast()
const { info } = useAppEnv()
const logOpen = ref(false)
</script>

<template>
  <PageShell id="jobs" title="バッチジョブ" icon="i-lucide-timer" description="定期実行ジョブの状態">
    <div class="rounded-lg border border-default divide-y divide-default">
      <div v-for="j in JOBS" :key="j.id" class="flex items-center gap-4 px-4 py-3">
        <UIcon :name="ST[j.status].icon" class="size-5" :class="[`text-${ST[j.status].color}`, j.status === 'running' && 'animate-spin']" />
        <div class="min-w-0 w-64">
          <p class="text-sm text-highlighted">{{ j.name }}</p>
          <p class="text-xs font-mono text-muted">{{ j.id }}</p>
        </div>
        <UKbd class="font-mono">{{ j.schedule }}</UKbd>
        <div class="text-xs text-muted w-40">
          <p>前回 {{ fmtDate(j.lastRun) }}</p>
          <p>所要 {{ j.duration }}</p>
        </div>
        <div class="text-xs text-muted w-28">次回 {{ j.next }}</div>
        <UBadge :color="ST[j.status].color" variant="subtle">{{ ST[j.status].label }}</UBadge>
        <div class="ml-auto flex gap-1">
          <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-file-text" label="ログ" @click="logOpen = true" />
          <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-play" label="今すぐ実行" :disabled="j.status === 'running'" @click="toast.add({ title: `${j.name} をキューに追加`, description: `環境: ${info.label}`, icon: 'i-lucide-play' })" />
        </div>
      </div>
    </div>
    <UModal v-model:open="logOpen" title="nightly-report #4821" :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <pre class="text-xs font-mono bg-muted rounded p-4 overflow-x-auto leading-relaxed">[03:00:01] INFO  start nightly-report
[03:00:02] INFO  fetching orders 2026-11-19 (JST)
[03:02:40] INFO  aggregated 2,931 orders
[03:04:10] WARN  slow query: sales_by_category (12.3s)
[03:04:13] <span class="text-error">ERROR upload to s3://reports/2026/11/19.csv failed: AccessDenied</span>
[03:04:13] <span class="text-error">ERROR exit code 1</span></pre>
      </template>
    </UModal>
  </PageShell>
</template>
