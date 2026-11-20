<script setup lang="ts">
const s = reactive({ mfaRequired: true, sessionHours: 8, ipAllow: '10.0.0.0/8\n192.168.10.0/24', pwMin: 12 })
const sessions = [
  { device: 'MacBook Pro · Chrome', ip: '10.2.14.8', loc: '東京', at: '現在のセッション', current: true },
  { device: 'iPhone · Safari', ip: '10.4.2.91', loc: '東京', at: '2時間前', current: false },
  { device: 'Windows · Edge', ip: '10.7.33.2', loc: '大阪', at: '3日前', current: false }
]
</script>

<template>
  <PageShell id="settings-security" title="セキュリティ" icon="i-lucide-lock">
    <div class="max-w-3xl space-y-6">
      <UPageCard title="認証ポリシー" variant="subtle">
        <div class="space-y-4">
          <USwitch v-model="s.mfaRequired" label="全管理者に MFA を必須にする" description="次回ログイン時に設定を求めます" />
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="セッション有効時間 (時間)"><UInputNumber v-model="s.sessionHours" :min="1" :max="72" class="w-full" /></UFormField>
            <UFormField label="パスワード最小文字数"><UInputNumber v-model="s.pwMin" :min="8" class="w-full" /></UFormField>
          </div>
          <UFormField label="IP 許可リスト" help="1行に1つ (CIDR)"><UTextarea v-model="s.ipAllow" :rows="3" class="w-full font-mono" /></UFormField>
        </div>
      </UPageCard>
      <UPageCard title="ログイン中のセッション" variant="subtle" :ui="{ container: 'divide-y divide-default' }">
        <div v-for="x in sessions" :key="x.ip" class="flex items-center gap-3 py-3">
          <UIcon :name="x.device.startsWith('iPhone') ? 'i-lucide-smartphone' : 'i-lucide-laptop'" class="size-5 text-dimmed" />
          <div><p class="text-sm text-highlighted">{{ x.device }}</p><p class="text-xs text-muted">{{ x.ip }} · {{ x.loc }} · {{ x.at }}</p></div>
          <UBadge v-if="x.current" color="success" variant="subtle" class="ml-auto">このデバイス</UBadge>
          <UButton v-else size="xs" color="error" variant="ghost" label="ログアウト" class="ml-auto" />
        </div>
      </UPageCard>
    </div>
  </PageShell>
</template>
