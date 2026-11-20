<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Product } from '~/utils/mock'

const UBadge = resolveComponent('UBadge')
const q = ref('')
const status = ref('all')
const sorting = ref([{ id: 'updatedAt', desc: true }])
const STATUS = { published: { label: '公開', color: 'success' }, draft: { label: '下書き', color: 'neutral' }, archived: { label: 'アーカイブ', color: 'warning' } } as const
const rows = computed(() => PRODUCTS.filter(p => (status.value === 'all' || p.status === status.value) && (!q.value || p.name.includes(q.value) || p.sku.includes(q.value))))
const sortHeader = (label: string) => ({ column }: any) => h(resolveComponent('UButton'), {
  color: 'neutral', variant: 'ghost', size: 'xs', label, class: '-mx-2.5',
  trailingIcon: column.getIsSorted() ? (column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down') : 'i-lucide-arrow-up-down',
  onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
})
const columns: TableColumn<Product>[] = [
  { accessorKey: 'sku', header: 'SKU', cell: ({ row }) => h('span', { class: 'font-mono text-xs' }, row.original.sku) },
  { accessorKey: 'name', header: sortHeader('商品名'), cell: ({ row }) => h('span', { class: 'text-highlighted' }, row.original.name) },
  { accessorKey: 'category', header: 'カテゴリ' },
  { accessorKey: 'price', header: sortHeader('価格'), cell: ({ row }) => h('span', { class: 'tabular-nums' }, yen(row.original.price)) },
  { accessorKey: 'stock', header: sortHeader('在庫'), cell: ({ row }) => h('span', { class: ['tabular-nums', row.original.stock === 0 ? 'text-error' : row.original.stock <= row.original.threshold ? 'text-warning' : ''] }, row.original.stock) },
  { accessorKey: 'status', header: '状態', cell: ({ row }) => h(UBadge, { color: STATUS[row.original.status].color, variant: 'subtle' }, () => STATUS[row.original.status].label) },
  { accessorKey: 'updatedAt', header: sortHeader('更新日時'), cell: ({ row }) => h('span', { class: 'text-xs text-muted' }, fmtDate(row.original.updatedAt)) }
]
const open = ref(false)
</script>

<template>
  <PageShell id="products" title="商品一覧" icon="i-lucide-box" :description="`${rows.length} 件`">
    <template #actions>
      <UButton icon="i-lucide-download" color="neutral" variant="outline" size="sm" label="エクスポート" />
      <UButton icon="i-lucide-plus" size="sm" label="商品を追加" @click="open = true" />
    </template>
    <template #toolbar>
      <div class="flex items-center gap-2">
        <UInput v-model="q" icon="i-lucide-search" placeholder="商品名・SKU" size="sm" class="w-72" />
        <UTabs v-model="status" :content="false" size="xs" :items="[{ label: 'すべて', value: 'all' }, { label: '公開', value: 'published' }, { label: '下書き', value: 'draft' }, { label: 'アーカイブ', value: 'archived' }]" />
      </div>
    </template>
    <UTable v-model:sorting="sorting" :data="rows" :columns="columns" sticky class="border border-default rounded-lg max-h-[calc(100vh-14rem)]" />

    <USlideover v-model:open="open" title="商品を追加" description="下書きとして保存されます">
      <template #body>
        <div class="space-y-4">
          <UFormField label="商品名" required><UInput class="w-full" /></UFormField>
          <UFormField label="SKU"><UInput class="w-full" placeholder="SKU-XXXX" /></UFormField>
          <UFormField label="カテゴリ"><USelect class="w-full" :items="CATEGORIES.filter(c => c.parent).map(c => c.name)" /></UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="価格 (税込)"><UInputNumber :default-value="1000" :step="100" class="w-full" /></UFormField>
            <UFormField label="初期在庫"><UInputNumber :default-value="0" class="w-full" /></UFormField>
          </div>
          <UFormField label="説明"><UTextarea :rows="5" class="w-full" /></UFormField>
          <USwitch label="すぐに公開する" />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="キャンセル" @click="open = false" />
          <UButton label="保存" @click="open = false" />
        </div>
      </template>
    </USlideover>
  </PageShell>
</template>
