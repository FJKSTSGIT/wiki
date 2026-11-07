<script setup lang="ts">
import { subDays } from 'date-fns'
import type { TableColumn } from '@nuxt/ui'
import type { Purchase } from '~/types'
import type { TableFilter, TableQuery } from '~/components/app/AppDataTable.vue'
import type { CsvColumn } from '~/utils/csv'
import { PRODUCTS } from '~/utils/mock/generate'

definePageMeta({ permission: 'purchases.view' })
useHead({ title: '課金履歴' })

const route = useRoute()
const db = useMockDb()
const { can } = usePermission()
const confirm = useConfirm()
const toast = useToast()
const { record } = useAuditLog()
const { sortable, statusBadge, UButton } = useTableColumns()

// プレイヤー詳細から遷移した場合はプレイヤー ID で絞り込む
const query = ref<TableQuery>({ q: (route.query.player as string) ?? '', filters: {} })

const purchases = computed(() => db.value.purchases)

async function refund(p: Purchase) {
  const ok = await confirm({
    title: '返金処理を行いますか？',
    description: 'ストアへの返金リクエストを作成し、付与済みアイテムを回収します（モック）。',
    color: 'error',
    confirmLabel: '返金する',
    details: [
      { label: '取引ID', value: p.id },
      { label: 'プレイヤー', value: `${p.playerName}（${p.playerId}）` },
      { label: '商品', value: p.productName },
      { label: '金額', value: formatYen(p.amount) }
    ]
  })
  if (!ok) return
  const target = db.value.purchases.find(x => x.id === p.id)!
  target.status = 'refunded'
  const player = db.value.players.find(x => x.id === p.playerId)
  if (player) player.totalSpend -= p.amount
  record({ category: 'purchase', action: '返金処理', target: p.id, detail: `${p.productName} ${formatYen(p.amount)}` })
  toast.add({ title: '返金処理を受け付けました', description: `${p.id} / ${formatYen(p.amount)}`, color: 'success' })
}

const columns: TableColumn<Purchase>[] = [
  { accessorKey: 'id', header: sortable('取引ID'), cell: ({ row }) => h('code', { class: 'text-xs' }, row.original.id) },
  { accessorKey: 'purchasedAt', header: sortable('購入日時'), cell: ({ row }) => h('span', { class: 'tabular-nums' }, formatDateTime(row.original.purchasedAt)) },
  { accessorKey: 'playerName', header: 'プレイヤー', cell: ({ row }) => h('div', [h('p', { class: 'text-highlighted' }, row.original.playerName), h('p', { class: 'text-xs text-muted' }, row.original.playerId)]) },
  { accessorKey: 'productName', header: sortable('商品'), cell: ({ row }) => h('div', [h('p', { class: 'text-default' }, row.original.productName), h('p', { class: 'text-xs text-muted' }, row.original.category)]) },
  { accessorKey: 'platform', header: 'OS' },
  { accessorKey: 'amount', header: sortable('金額', 'right'), meta: { class: { th: 'text-right', td: 'text-right tabular-nums font-medium text-highlighted' } }, cell: ({ row }) => formatYen(row.original.amount) },
  { accessorKey: 'status', header: 'ステータス', cell: ({ row }) => statusBadge(PURCHASE_STATUS[row.original.status]) },
  {
    id: 'actions',
    enableHiding: false,
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) => can('purchases.edit') && row.original.status === 'completed'
      ? h(UButton, { label: '返金', size: 'xs', color: 'neutral', variant: 'outline', icon: 'i-lucide-undo-2', onClick: (e: Event) => { e.stopPropagation(); refund(row.original) } })
      : null
  }
]

const periods = [
  { label: '過去 24 時間', value: '1' },
  { label: '過去 7 日間', value: '7' },
  { label: '過去 30 日間', value: '30' },
  { label: '過去 90 日間', value: '90' }
]

const filters: TableFilter<Purchase>[] = [
  {
    key: 'period',
    label: '期間',
    icon: 'i-lucide-calendar',
    options: periods,
    match: (row, values) => {
      const days = Math.max(...values.map(Number))
      return row.purchasedAt >= subDays(new Date(), days).toISOString()
    }
  },
  { key: 'status', label: 'ステータス', icon: 'i-lucide-circle-dot', options: toOptions(PURCHASE_STATUS) },
  { key: 'platform', label: 'OS', icon: 'i-lucide-smartphone', options: ['iOS', 'Android', 'PC'].map(v => ({ label: v, value: v })) },
  { key: 'category', label: 'カテゴリ', icon: 'i-lucide-tag', options: [...new Set(PRODUCTS.map(p => p.category))].map(v => ({ label: v, value: v })) },
  { key: 'productId', label: '商品', icon: 'i-lucide-package', options: PRODUCTS.map(p => ({ label: p.name, value: p.id })) }
]

const csvColumns: CsvColumn<Purchase>[] = [
  { header: '取引ID', key: 'id' },
  { header: '購入日時', value: r => formatDateTime(r.purchasedAt) },
  { header: 'プレイヤーID', key: 'playerId' },
  { header: 'プレイヤー名', key: 'playerName' },
  { header: '商品ID', key: 'productId' },
  { header: '商品名', key: 'productName' },
  { header: 'カテゴリ', key: 'category' },
  { header: 'OS', key: 'platform' },
  { header: '金額（円）', key: 'amount' },
  { header: 'ステータス', value: r => PURCHASE_STATUS[r.status].label }
]

function summarize(rows: Purchase[]) {
  const completed = rows.filter(r => r.status === 'completed')
  return {
    count: rows.length,
    revenue: completed.reduce((s, r) => s + r.amount, 0),
    refunded: rows.filter(r => r.status === 'refunded').reduce((s, r) => s + r.amount, 0),
    payers: new Set(completed.map(r => r.playerId)).size
  }
}
</script>

<template>
  <AppPage id="purchases" title="課金履歴">
    <AppDataTable
      v-model:query="query"
      :data="purchases"
      :columns="columns"
      :filters="filters"
      :search-keys="['id', 'playerId', 'playerName', 'productName']"
      search-placeholder="取引ID・プレイヤー・商品名で検索…"
      :csv="{ filename: 'purchases', columns: csvColumns, permission: 'purchases.export', label: '課金履歴' }"
      :column-labels="{ id: '取引ID', purchasedAt: '購入日時', playerName: 'プレイヤー', productName: '商品', platform: 'OS', amount: '金額', status: 'ステータス' }"
      :initial-sorting="[{ id: 'purchasedAt', desc: true }]"
      :page-size="50"
      selectable
    >
      <template #summary="{ rows }">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div v-for="s in [
            { label: '取引件数', value: formatNumber(summarize(rows).count) + ' 件' },
            { label: '売上（完了）', value: formatYen(summarize(rows).revenue) },
            { label: '課金ユーザー数', value: formatNumber(summarize(rows).payers) + ' 名' },
            { label: '返金額', value: formatYen(summarize(rows).refunded) }
          ]" :key="s.label" class="rounded-lg border border-default px-4 py-2.5"
          >
            <p class="text-xs text-muted">
              {{ s.label }}
            </p>
            <p class="font-semibold text-highlighted tabular-nums">
              {{ s.value }}
            </p>
          </div>
        </div>
      </template>
    </AppDataTable>
  </AppPage>
</template>
