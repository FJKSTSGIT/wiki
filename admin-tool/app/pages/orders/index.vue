<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Order, OrderStatus } from '~/utils/mock'

const UBadge = resolveComponent('UBadge')
const status = ref<'all' | OrderStatus>('all')
const q = ref('')
const rows = computed(() => ORDERS.filter(o => (status.value === 'all' || o.status === status.value) && (!q.value || o.id.includes(q.value) || o.customer.includes(q.value))))
const counts = computed(() => Object.fromEntries((Object.keys(ORDER_STATUS) as OrderStatus[]).map(s => [s, ORDERS.filter(o => o.status === s).length])))
const selected = ref<Order | null>(null)

const columns: TableColumn<Order>[] = [
  { accessorKey: 'id', header: '注文番号', cell: ({ row }) => h('span', { class: 'font-mono text-xs text-highlighted' }, row.original.id) },
  { accessorKey: 'createdAt', header: '注文日時', cell: ({ row }) => h('span', { class: 'text-xs text-muted' }, fmtDate(row.original.createdAt)) },
  { accessorKey: 'customer', header: '顧客' },
  { accessorKey: 'items', header: '点数', meta: { class: { td: 'tabular-nums' } } },
  { accessorKey: 'payment', header: '支払方法' },
  { accessorKey: 'status', header: 'ステータス', cell: ({ row }) => h(UBadge, { color: ORDER_STATUS[row.original.status].color, variant: 'subtle' }, () => ORDER_STATUS[row.original.status].label) },
  { accessorKey: 'total', header: () => h('div', { class: 'text-right' }, '合計'), cell: ({ row }) => h('div', { class: 'text-right tabular-nums' }, yen(row.original.total)) }
]
const steps = ['pending', 'paid', 'shipped', 'delivered'] as const
</script>

<template>
  <PageShell id="orders" title="注文一覧" icon="i-lucide-receipt" :description="`${rows.length} 件`">
    <template #actions>
      <UButton icon="i-lucide-download" color="neutral" variant="outline" size="sm" label="CSV" />
    </template>
    <template #toolbar>
      <div class="flex items-center gap-2 w-full overflow-x-auto">
        <UInput v-model="q" icon="i-lucide-search" placeholder="注文番号・顧客名" size="sm" class="w-64 shrink-0" />
        <UButton size="xs" :variant="status === 'all' ? 'soft' : 'ghost'" color="neutral" label="すべて" @click="status = 'all'" />
        <UButton
          v-for="(s, k) in ORDER_STATUS" :key="k" size="xs" :variant="status === k ? 'soft' : 'ghost'" :color="status === k ? s.color : 'neutral'"
          @click="status = k"
        >
          {{ s.label }} <span class="text-dimmed tabular-nums">{{ counts[k] }}</span>
        </UButton>
      </div>
    </template>
    <UTable :data="rows" :columns="columns" class="border border-default rounded-lg" :ui="{ tr: 'cursor-pointer' }" @select="(_e: Event, row: any) => selected = row.original" />

    <USlideover :open="!!selected" :title="selected?.id" :description="selected ? fmtDate(selected.createdAt) : undefined" @update:open="v => !v && (selected = null)">
      <template #body>
        <div v-if="selected" class="space-y-6 text-sm">
          <div class="flex items-center gap-1">
            <template v-for="(s, i) in steps" :key="s">
              <div class="flex-1 h-1 rounded-full" :class="steps.indexOf(selected.status as any) >= i ? 'bg-primary' : 'bg-accented'" />
            </template>
          </div>
          <div class="flex justify-between text-xs text-muted -mt-4">
            <span v-for="s in steps" :key="s">{{ ORDER_STATUS[s].label }}</span>
          </div>
          <dl class="grid grid-cols-2 gap-y-3">
            <dt class="text-muted">顧客</dt><dd>{{ selected.customer }}</dd>
            <dt class="text-muted">支払方法</dt><dd>{{ selected.payment }}</dd>
            <dt class="text-muted">点数</dt><dd>{{ selected.items }} 点</dd>
            <dt class="text-muted">合計</dt><dd class="font-semibold text-highlighted">{{ yen(selected.total) }}</dd>
          </dl>
          <USeparator />
          <div>
            <p class="text-xs text-muted mb-2">明細</p>
            <div v-for="n in selected.items" :key="n" class="flex justify-between py-1.5">
              <span>{{ PRODUCTS[(n * 7 + selected.total) % PRODUCTS.length]!.name }}</span>
              <span class="tabular-nums text-muted">× 1</span>
            </div>
          </div>
          <UFormField label="社内メモ"><UTextarea class="w-full" :rows="3" /></UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2 w-full">
          <UButton color="error" variant="outline" icon="i-lucide-undo-2" label="返金" to="/orders/refunds" />
          <div class="flex-1" />
          <UButton icon="i-lucide-truck" label="発送済にする" />
        </div>
      </template>
    </USlideover>
  </PageShell>
</template>
