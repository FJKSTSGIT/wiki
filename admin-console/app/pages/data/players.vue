<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Player } from '~/types'
import type { TableFilter, TableQuery } from '~/components/app/AppDataTable.vue'
import type { CsvColumn } from '~/utils/csv'

definePageMeta({ permission: 'players.view' })
useHead({ title: 'プレイヤー' })

const db = useMockDb()
const { can } = usePermission()
const confirm = useConfirm()
const toast = useToast()
const { record } = useAuditLog()
const { sortable, statusBadge, identity } = useTableColumns()

const players = computed(() => db.value.players)
const query = ref<TableQuery>({ q: '', filters: {} })

const columns: TableColumn<Player>[] = [
  { accessorKey: 'name', header: sortable('プレイヤー'), enableHiding: false, cell: ({ row }) => identity(row.original.name, row.original.id) },
  { accessorKey: 'platform', header: 'OS' },
  { accessorKey: 'status', header: 'ステータス', cell: ({ row }) => statusBadge(PLAYER_STATUS[row.original.status]) },
  { accessorKey: 'level', header: sortable('Lv', 'right'), meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } } },
  { accessorKey: 'country', header: '国・地域' },
  { accessorKey: 'totalSpend', header: sortable('累計課金', 'right'), meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } }, cell: ({ row }) => formatYen(row.original.totalSpend) },
  { accessorKey: 'registeredAt', header: sortable('登録日'), cell: ({ row }) => h('span', { class: 'tabular-nums text-muted' }, formatDate(row.original.registeredAt)) },
  { accessorKey: 'lastLoginAt', header: sortable('最終ログイン'), cell: ({ row }) => h('span', { class: 'tabular-nums text-muted', title: formatDateTime(row.original.lastLoginAt) }, formatRelative(row.original.lastLoginAt)) }
]

const spendRanges = [
  { label: '無課金', value: '0', min: 0, max: 0 },
  { label: '〜 ¥10,000', value: '1', min: 1, max: 10000 },
  { label: '¥10,001 〜 ¥100,000', value: '2', min: 10001, max: 100000 },
  { label: '¥100,001 〜', value: '3', min: 100001, max: Infinity }
]

const filters: TableFilter<Player>[] = [
  { key: 'status', label: 'ステータス', icon: 'i-lucide-circle-dot', options: toOptions(PLAYER_STATUS) },
  { key: 'platform', label: 'OS', icon: 'i-lucide-smartphone', options: ['iOS', 'Android', 'PC'].map(v => ({ label: v, value: v })) },
  { key: 'country', label: '国・地域', icon: 'i-lucide-globe', options: [...new Set(db.value.players.map(p => p.country))].map(v => ({ label: v, value: v })) },
  {
    key: 'spend',
    label: '累計課金',
    icon: 'i-lucide-japanese-yen',
    options: spendRanges.map(({ label, value }) => ({ label, value })),
    match: (row, values) => values.some((v) => {
      const r = spendRanges.find(x => x.value === v)!
      return row.totalSpend >= r.min && row.totalSpend <= r.max
    })
  }
]

const csvColumns: CsvColumn<Player>[] = [
  { header: 'プレイヤーID', key: 'id' },
  { header: 'プレイヤー名', key: 'name' },
  { header: 'OS', key: 'platform' },
  { header: 'ステータス', value: r => PLAYER_STATUS[r.status].label },
  { header: 'レベル', key: 'level' },
  { header: '国・地域', key: 'country' },
  { header: '累計課金額', key: 'totalSpend' },
  { header: '課金回数', key: 'purchaseCount' },
  { header: '登録日時', value: r => formatDateTime(r.registeredAt) },
  { header: '最終ログイン', value: r => formatDateTime(r.lastLoginAt) }
]

/* ---- 詳細 ---- */
const selected = ref<Player>()
const detailOpen = computed({ get: () => !!selected.value, set: (v) => { if (!v) selected.value = undefined } })
const selectedPurchases = computed(() => db.value.purchases.filter(p => p.playerId === selected.value?.id).slice(0, 8))

async function toggleBan(player: Player) {
  const ban = player.status !== 'banned'
  const ok = await confirm({
    title: ban ? `${player.name} のアカウントを停止しますか？` : `${player.name} の停止を解除しますか？`,
    description: ban ? '停止中のプレイヤーはゲームにログインできなくなります。' : '解除するとプレイヤーは再びログインできるようになります。',
    color: ban ? 'error' : 'primary',
    confirmLabel: ban ? '停止する' : '解除する',
    confirmText: ban ? player.id : undefined
  })
  if (!ok) return
  const target = db.value.players.find(p => p.id === player.id)!
  target.status = ban ? 'banned' : 'active'
  record({ category: 'player', action: ban ? 'アカウントを停止' : '停止を解除', target: player.id })
  toast.add({ title: ban ? 'アカウントを停止しました' : '停止を解除しました', description: player.name, color: 'success' })
}
</script>

<template>
  <AppPage id="players" title="プレイヤー">
    <AppDataTable
      v-model:query="query"
      :data="players"
      :columns="columns"
      :filters="filters"
      :search-keys="['name', 'id']"
      search-placeholder="プレイヤー名・ID で検索…"
      :csv="{ filename: 'players', columns: csvColumns, permission: 'players.export', label: 'プレイヤー一覧' }"
      :column-labels="{ name: 'プレイヤー', platform: 'OS', status: 'ステータス', level: 'Lv', country: '国・地域', totalSpend: '累計課金', registeredAt: '登録日', lastLoginAt: '最終ログイン' }"
      :initial-sorting="[{ id: 'lastLoginAt', desc: true }]"
      selectable
      clickable
      @row-click="(p) => selected = p"
    >
      <template #summary="{ rows }">
        <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          <span>対象 <b class="text-highlighted tabular-nums">{{ formatNumber(rows.length) }}</b> 名</span>
          <span>累計課金合計 <b class="text-highlighted tabular-nums">{{ formatYen(rows.reduce((s, r) => s + r.totalSpend, 0)) }}</b></span>
          <span>課金者率 <b class="text-highlighted tabular-nums">{{ formatPercent(rows.filter(r => r.totalSpend > 0).length / Math.max(1, rows.length)) }}</b></span>
        </div>
      </template>
    </AppDataTable>

    <USlideover v-model:open="detailOpen" :title="selected?.name" :description="selected?.id" :ui="{ content: 'max-w-lg' }">
      <template #body>
        <div v-if="selected" class="space-y-6">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge :label="PLAYER_STATUS[selected.status].label" :color="PLAYER_STATUS[selected.status].color" variant="subtle" />
            <UBadge :label="selected.platform" color="neutral" variant="outline" />
            <UBadge :label="`Lv.${selected.level}`" color="neutral" variant="outline" />
          </div>

          <AppDescriptionList
            :items="[
              { label: 'プレイヤーID', value: selected.id },
              { label: '国・地域', value: selected.country },
              { label: '累計課金額', value: formatYen(selected.totalSpend) },
              { label: '課金回数', value: `${selected.purchaseCount} 回` },
              { label: '登録日時', value: formatDateTime(selected.registeredAt) },
              { label: '最終ログイン', value: `${formatDateTime(selected.lastLoginAt)}（${formatRelative(selected.lastLoginAt)}）` }
            ]"
          />

          <div v-if="can('purchases.view')">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-highlighted">
                最近の課金
              </h3>
              <UButton :to="{ path: '/data/purchases', query: { player: selected.id } }" label="すべて表示" size="xs" variant="link" color="neutral" trailing-icon="i-lucide-arrow-right" />
            </div>
            <ul v-if="selectedPurchases.length" class="divide-y divide-default rounded-lg border border-default text-sm">
              <li v-for="p in selectedPurchases" :key="p.id" class="flex items-center justify-between gap-3 px-4 py-2">
                <div class="min-w-0">
                  <p class="truncate text-highlighted">
                    {{ p.productName }}
                  </p>
                  <p class="text-xs text-muted tabular-nums">
                    {{ formatDateTime(p.purchasedAt) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="p.status !== 'completed'" :label="PURCHASE_STATUS[p.status].label" :color="PURCHASE_STATUS[p.status].color" variant="subtle" size="sm" />
                  <span class="tabular-nums text-highlighted">{{ formatYen(p.amount) }}</span>
                </div>
              </li>
            </ul>
            <p v-else class="text-sm text-muted">
              課金履歴はありません
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div v-if="selected" class="flex w-full justify-end gap-2">
          <UButton label="閉じる" color="neutral" variant="ghost" @click="selected = undefined" />
          <AppCan permission="players.edit" mode="disable">
            <UButton
              :label="selected.status === 'banned' ? '停止を解除' : 'アカウント停止'"
              :icon="selected.status === 'banned' ? 'i-lucide-rotate-ccw' : 'i-lucide-ban'"
              :color="selected.status === 'banned' ? 'primary' : 'error'"
              :variant="selected.status === 'banned' ? 'solid' : 'soft'"
              @click="toggleBan(selected)"
            />
          </AppCan>
        </div>
      </template>
    </USlideover>
  </AppPage>
</template>
