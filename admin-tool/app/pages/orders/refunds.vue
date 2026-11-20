<script setup lang="ts">
const ST = { requested: { label: '申請中', color: 'warning' }, approved: { label: '承認済', color: 'info' }, rejected: { label: '却下', color: 'neutral' }, completed: { label: '完了', color: 'success' } } as const
const list = ref(REFUNDS.map(r => ({ ...r })))
const toast = useToast()
const confirmTarget = ref<(typeof list.value)[number] | null>(null)
const { current } = useAppEnv()
</script>

<template>
  <PageShell id="refunds" title="返品・返金" icon="i-lucide-undo-2" description="返金申請の審査">
    <div class="rounded-lg border border-default divide-y divide-default">
      <div v-for="r in list" :key="r.id" class="flex items-center gap-4 px-4 py-3 text-sm">
        <span class="font-mono text-xs w-16">{{ r.id }}</span>
        <NuxtLink to="/orders" class="font-mono text-xs text-muted hover:underline w-24">{{ r.order }}</NuxtLink>
        <span class="w-28 truncate">{{ r.customer }}</span>
        <UBadge color="neutral" variant="outline" size="sm">{{ r.reason }}</UBadge>
        <span class="text-xs text-dimmed">{{ fmtDate(r.requestedAt) }}</span>
        <span class="ml-auto tabular-nums text-highlighted">{{ yen(r.amount) }}</span>
        <UBadge :color="ST[r.status].color" variant="subtle" class="w-16 justify-center">{{ ST[r.status].label }}</UBadge>
        <div class="w-40 flex justify-end gap-1">
          <template v-if="r.status === 'requested'">
            <UButton size="xs" color="neutral" variant="ghost" label="却下" @click="r.status = 'rejected'" />
            <UButton size="xs" label="承認" @click="confirmTarget = r" />
          </template>
        </div>
      </div>
    </div>
    <ConfirmDanger
      :open="!!confirmTarget" :title="`${confirmTarget?.id} の返金を承認しますか？`"
      :description="confirmTarget ? `${yen(confirmTarget.amount)} が ${confirmTarget.customer} 様に返金されます。` : ''"
      :confirm-word="current === 'prod' ? confirmTarget?.id : undefined"
      @update:open="v => !v && (confirmTarget = null)"
      @confirm="confirmTarget && (confirmTarget.status = 'approved'); toast.add({ title: '返金を承認しました', icon: 'i-lucide-check' })"
    />
  </PageShell>
</template>
