<script setup lang="ts">
const rows = reactive([
  { key: 'order', label: '新規注文', desc: '注文が入ったとき', email: false, slack: true },
  { key: 'refund', label: '返金申請', desc: '返金申請が作成されたとき', email: true, slack: true },
  { key: 'stock', label: '在庫しきい値', desc: '在庫がしきい値を下回ったとき', email: true, slack: true },
  { key: 'job', label: 'バッチ失敗', desc: 'ジョブが失敗したとき', email: true, slack: true },
  { key: 'login', label: '不審なログイン', desc: '新しい端末・国からのログイン', email: true, slack: false }
])
</script>

<template>
  <PageShell id="settings-notifications" title="通知設定" icon="i-lucide-bell">
    <div class="max-w-3xl">
      <UPageCard title="通知チャネル" description="イベントごとの通知先" variant="subtle" :ui="{ container: 'divide-y divide-default' }">
        <div class="grid grid-cols-[1fr_80px_80px] text-xs text-muted pb-2">
          <span /><span class="text-center">メール</span><span class="text-center">Slack</span>
        </div>
        <div v-for="r in rows" :key="r.key" class="grid grid-cols-[1fr_80px_80px] items-center py-3">
          <div><p class="text-sm text-highlighted">{{ r.label }}</p><p class="text-xs text-muted">{{ r.desc }}</p></div>
          <div class="flex justify-center"><USwitch v-model="r.email" /></div>
          <div class="flex justify-center"><USwitch v-model="r.slack" /></div>
        </div>
      </UPageCard>
    </div>
  </PageShell>
</template>
