<script setup lang="ts">
const s = reactive({ name: 'Hatchery Store', url: 'https://store.example.com', email: 'support@example.com', tz: 'Asia/Tokyo', currency: 'JPY', maintenance: false })
const toast = useToast()
</script>

<template>
  <PageShell id="settings" title="一般設定" icon="i-lucide-sliders-horizontal">
    <template #actions>
      <UButton size="sm" label="保存" icon="i-lucide-save" @click="toast.add({ title: '設定を保存しました' })" />
    </template>
    <div class="max-w-3xl space-y-6">
      <UPageCard title="ストア情報" description="ストアの基本情報" variant="subtle">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="ストア名"><UInput v-model="s.name" class="w-full" /></UFormField>
          <UFormField label="URL"><UInput v-model="s.url" class="w-full" /></UFormField>
          <UFormField label="サポートメール"><UInput v-model="s.email" class="w-full" /></UFormField>
          <UFormField label="タイムゾーン"><USelect v-model="s.tz" :items="['Asia/Tokyo', 'UTC', 'America/Los_Angeles']" class="w-full" /></UFormField>
          <UFormField label="通貨"><USelect v-model="s.currency" :items="['JPY', 'USD', 'EUR']" class="w-full" /></UFormField>
        </div>
      </UPageCard>
      <UPageCard title="メンテナンスモード" description="有効にすると、管理者以外はメンテナンス画面が表示されます" variant="subtle" orientation="horizontal">
        <div class="flex justify-end"><USwitch v-model="s.maintenance" color="error" /></div>
      </UPageCard>
    </div>
  </PageShell>
</template>
