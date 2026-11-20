<script setup lang="ts">
const wh = ref('all')
const onlyLow = ref(false)
const rows = computed(() => PRODUCTS.filter(p => (wh.value === 'all' || p.warehouse === wh.value) && (!onlyLow.value || p.stock <= p.threshold)))
const totals = computed(() => ({
  sku: rows.value.length,
  units: rows.value.reduce((a, p) => a + p.stock, 0),
  out: rows.value.filter(p => p.stock === 0).length,
  low: rows.value.filter(p => p.stock > 0 && p.stock <= p.threshold).length
}))
const adjusting = ref<(typeof PRODUCTS)[number] | null>(null)
const delta = ref(0)
</script>

<template>
  <PageShell id="inventory" title="在庫" icon="i-lucide-warehouse" description="倉庫別の在庫状況">
    <template #actions>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" size="sm" label="WMSと同期" />
    </template>
    <template #toolbar>
      <div class="flex items-center gap-3">
        <USelect v-model="wh" size="sm" class="w-36" :items="[{ label: '全倉庫', value: 'all' }, '東京DC', '大阪DC', '福岡DC']" />
        <UCheckbox v-model="onlyLow" label="しきい値以下のみ" />
      </div>
    </template>
    <div class="grid grid-cols-4 gap-4 mb-6">
      <StatTile label="SKU数" :value="String(totals.sku)" icon="i-lucide-boxes" />
      <StatTile label="総在庫数" :value="totals.units.toLocaleString()" icon="i-lucide-package" />
      <StatTile label="在庫切れ" :value="String(totals.out)" icon="i-lucide-package-x" hint="要発注" />
      <StatTile label="残りわずか" :value="String(totals.low)" icon="i-lucide-triangle-alert" hint="しきい値以下" />
    </div>
    <div class="rounded-lg border border-default divide-y divide-default">
      <div class="grid grid-cols-[120px_1fr_100px_1fr_100px] gap-4 px-4 py-2 text-xs text-muted">
        <span>SKU</span><span>商品</span><span>倉庫</span><span>在庫 / しきい値</span><span />
      </div>
      <div v-for="p in rows" :key="p.id" class="grid grid-cols-[120px_1fr_100px_1fr_100px] gap-4 items-center px-4 py-2.5 text-sm">
        <span class="font-mono text-xs">{{ p.sku }}</span>
        <span class="truncate text-highlighted">{{ p.name }}</span>
        <span class="text-muted">{{ p.warehouse }}</span>
        <div class="flex items-center gap-3">
          <UProgress :model-value="Math.min(100, p.stock / 3)" size="sm" :color="p.stock === 0 ? 'error' : p.stock <= p.threshold ? 'warning' : 'primary'" class="flex-1" />
          <span class="w-16 text-right tabular-nums" :class="p.stock === 0 ? 'text-error' : p.stock <= p.threshold ? 'text-warning' : ''">{{ p.stock }} / {{ p.threshold }}</span>
        </div>
        <UButton size="xs" color="neutral" variant="outline" label="調整" icon="i-lucide-plus-minus" @click="adjusting = p; delta = 0" />
      </div>
    </div>

    <UModal :open="!!adjusting" :title="`在庫調整: ${adjusting?.name}`" @update:open="v => !v && (adjusting = null)">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">現在庫 <b class="text-highlighted">{{ adjusting?.stock }}</b> → 調整後 <b class="text-highlighted">{{ (adjusting?.stock ?? 0) + delta }}</b></p>
          <UFormField label="増減数"><UInputNumber v-model="delta" class="w-full" /></UFormField>
          <UFormField label="理由"><USelect class="w-full" :items="['入荷', '棚卸差異', '破損', '返品戻し']" default-value="入荷" /></UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="キャンセル" @click="adjusting = null" />
          <UButton label="反映" @click="adjusting && (adjusting.stock += delta); adjusting = null" />
        </div>
      </template>
    </UModal>
  </PageShell>
</template>
