<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * 共通データテーブル
 *
 * 一覧画面はこのコンポーネントを使うだけで以下が揃う:
 * - キーワード検索 / 選択式フィルター / 絞り込み条件のチップ表示・クリア
 * - ソート（列ヘッダー）/ 表示列の切替 / ページネーション / 表示件数変更
 * - 行選択と一括操作スロット
 * - CSV ダウンロード（現在の検索・フィルター・ソート状態を反映、選択行のみも可）
 *
 * 絞り込みは「クエリ状態（query）」として外に出せるので、本番ではこの状態を
 * API のクエリパラメータに変換してサーバー側で検索・CSV 生成する形に差し替えられる。
 */
import { getPaginationRowModel } from '@tanstack/table-core'
import type { SortingState } from '@tanstack/table-core'
import type { TableColumn } from '@nuxt/ui'
import type { CsvExportOptions } from '~/composables/useCsvExport'

export interface TableFilterOption {
  label: string
  value: string
}

export interface TableFilter<Row> {
  key: string
  label: string
  icon?: string
  options: TableFilterOption[]
  /** 行がフィルター値にマッチするか。未指定なら String(row[key]) で比較 */
  match?: (row: Row, values: string[]) => boolean
}

export interface TableQuery {
  q: string
  filters: Record<string, string[]>
}

const props = withDefaults(defineProps<{
  data: T[]
  columns: TableColumn<T>[]
  /** 行を一意に識別するキー */
  rowKey?: keyof T & string
  /** キーワード検索の対象キー */
  searchKeys?: (keyof T & string)[]
  searchPlaceholder?: string
  filters?: TableFilter<T>[]
  /** CSV 出力設定。指定するとツールバーにダウンロードボタンが表示される */
  csv?: CsvExportOptions<T>
  selectable?: boolean
  pageSize?: number
  loading?: boolean
  /** 行クリックで row-click を発火する */
  clickable?: boolean
  initialSorting?: SortingState
  /** 列表示切替メニューに出す列名（列 id → 表示名） */
  columnLabels?: Record<string, string>
  emptyText?: string
}>(), {
  rowKey: 'id' as any,
  searchKeys: () => [],
  searchPlaceholder: 'キーワードで検索…',
  filters: () => [],
  selectable: false,
  pageSize: 20,
  loading: false,
  clickable: false,
  initialSorting: () => [],
  columnLabels: () => ({}),
  emptyText: '条件に一致するデータがありません'
})

const emit = defineEmits<{ rowClick: [row: T] }>()

const slots = defineSlots<{
  'toolbar'?(props: object): any
  'bulk-actions'?(props: { selected: T[], clear: () => void }): any
  'summary'?(props: { rows: T[] }): any
}>()

/* ---------- クエリ状態（検索・フィルター） ---------- */
const query = defineModel<TableQuery>('query', { default: () => ({ q: '', filters: {} }) })

const search = computed({
  get: () => query.value.q,
  set: (q: string) => { query.value = { ...query.value, q } }
})
const debouncedSearch = refDebounced(search, 200)

function filterValue(key: string) {
  return query.value.filters[key] ?? []
}
function setFilter(key: string, values: string[]) {
  query.value = { ...query.value, filters: { ...query.value.filters, [key]: values } }
}

const activeFilterChips = computed(() =>
  props.filters.flatMap(f => filterValue(f.key).map(value => ({
    key: f.key,
    value,
    label: `${f.label}：${f.options.find(o => o.value === value)?.label ?? value}`
  })))
)
const hasConditions = computed(() => !!query.value.q || activeFilterChips.value.length > 0)

function removeChip(key: string, value: string) {
  setFilter(key, filterValue(key).filter(v => v !== value))
}
function resetQuery() {
  query.value = { q: '', filters: {} }
}

const filteredData = computed(() => {
  const q = debouncedSearch.value.trim().toLowerCase()
  return props.data.filter((row) => {
    if (q && props.searchKeys.length && !props.searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))) {
      return false
    }
    return props.filters.every((f) => {
      const values = filterValue(f.key)
      if (!values.length) return true
      return f.match ? f.match(row, values) : values.includes(String(row[f.key]))
    })
  })
})

/** CSV・ログ用：人が読める絞り込み条件 */
const conditionsText = computed(() => [
  query.value.q ? `検索「${query.value.q}」` : '',
  ...activeFilterChips.value.map(c => c.label)
].filter(Boolean).join(', '))

/* ---------- テーブル状態 ---------- */
const table = useTemplateRef('table')
const sorting = ref<SortingState>([...props.initialSorting])
const rowSelection = ref<Record<string, boolean>>({})
const columnVisibility = ref<Record<string, boolean>>({})
const pagination = ref({ pageIndex: 0, pageSize: props.pageSize })

// 絞り込みが変わったら 1 ページ目へ
watch([debouncedSearch, () => query.value.filters], () => {
  pagination.value = { ...pagination.value, pageIndex: 0 }
}, { deep: true })

const tableColumns = computed<TableColumn<T>[]>(() => {
  if (!props.selectable) return props.columns
  return [{
    id: '__select',
    enableHiding: false,
    enableSorting: false,
    meta: { class: { th: 'w-10', td: 'w-10' } },
    header: ({ table }) => h(resolveComponent('UCheckbox'), {
      'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (v: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!v),
      'ariaLabel': 'すべて選択'
    }),
    cell: ({ row }) => h(resolveComponent('UCheckbox'), {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (v: boolean | 'indeterminate') => row.toggleSelected(!!v),
      'onClick': (e: Event) => e.stopPropagation(),
      'ariaLabel': '行を選択'
    })
  }, ...props.columns]
})

/** フィルター・ソート適用後（ページング前）の行 */
const processedRows = computed<T[]>(() => {
  // sorting / filteredData の変化を追跡させる
  void sorting.value
  void filteredData.value
  return table.value?.tableApi?.getPrePaginationRowModel().rows.map(r => r.original) ?? filteredData.value
})

const selectedRows = computed<T[]>(() => {
  const keys = new Set(Object.keys(rowSelection.value).filter(k => rowSelection.value[k]))
  return filteredData.value.filter(r => keys.has(String(r[props.rowKey])))
})

function clearSelection() {
  rowSelection.value = {}
}

const pageCount = computed(() => Math.max(1, Math.ceil(filteredData.value.length / pagination.value.pageSize)))
const rangeText = computed(() => {
  const total = filteredData.value.length
  if (!total) return '0 件'
  const start = pagination.value.pageIndex * pagination.value.pageSize + 1
  const end = Math.min(total, start + pagination.value.pageSize - 1)
  return `${total.toLocaleString()} 件中 ${start.toLocaleString()}–${end.toLocaleString()} 件`
})

const visibilityItems = computed(() =>
  (table.value?.tableApi?.getAllLeafColumns() ?? [])
    .filter(c => c.getCanHide())
    .map(c => ({
      label: props.columnLabels[c.id] ?? (typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id),
      type: 'checkbox' as const,
      checked: c.getIsVisible(),
      onUpdateChecked: (checked: boolean) => c.toggleVisibility(!!checked),
      onSelect: (e: Event) => e.preventDefault()
    }))
)

/* ---------- CSV ---------- */
const { exportCsv } = useCsvExport()
const { can } = usePermission()
const canExport = computed(() => !props.csv?.permission || can(props.csv.permission))

function exportRows(scope: 'filtered' | 'selected') {
  if (!props.csv) return
  const rows = scope === 'selected' ? sortLike(selectedRows.value) : processedRows.value
  exportCsv(rows, props.csv, {
    conditions: scope === 'selected' ? '選択行のみ' : conditionsText.value || '条件なし'
  })
}

/** 選択行を画面と同じ並び順にする */
function sortLike(rows: T[]) {
  const order = new Map(processedRows.value.map((r, i) => [r[props.rowKey], i]))
  return [...rows].sort((a, b) => (order.get(a[props.rowKey]) ?? 0) - (order.get(b[props.rowKey]) ?? 0))
}

const csvMenu = computed(() => [[
  {
    label: `現在の条件で出力（${processedRows.value.length.toLocaleString()} 件）`,
    icon: 'i-lucide-filter',
    onSelect: () => exportRows('filtered')
  },
  {
    label: `選択行のみ出力（${selectedRows.value.length.toLocaleString()} 件）`,
    icon: 'i-lucide-list-checks',
    disabled: !selectedRows.value.length,
    onSelect: () => exportRows('selected')
  }
]])

function onSelectRow(_e: Event, row: { original: T }) {
  if (props.clickable) emit('rowClick', row.original)
}

defineExpose({ filteredRows: processedRows, selectedRows, resetQuery, clearSelection })
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <!-- ツールバー -->
    <div class="flex flex-wrap items-center gap-2">
      <UInput
        v-if="searchKeys.length"
        v-model="search"
        icon="i-lucide-search"
        :placeholder="searchPlaceholder"
        class="w-full sm:w-64"
        :ui="{ trailing: 'pe-1' }"
      >
        <template v-if="search" #trailing>
          <UButton color="neutral" variant="link" size="sm" icon="i-lucide-x" aria-label="検索をクリア" @click="search = ''" />
        </template>
      </UInput>

      <USelectMenu
        v-for="f in filters"
        :key="f.key"
        :model-value="filterValue(f.key)"
        :items="f.options"
        value-key="value"
        multiple
        :search-input="f.options.length > 8 ? { placeholder: '絞り込み…' } : false"
        :icon="f.icon ?? 'i-lucide-list-filter'"
        :placeholder="f.label"
        :aria-label="f.label"
        class="w-[calc(50%-0.25rem)] sm:w-auto sm:min-w-32"
        :ui="{ content: 'min-w-48' }"
        @update:model-value="(v: string[]) => setFilter(f.key, v)"
      >
        <template #default="{ modelValue }">
          <span v-if="!modelValue?.length" class="text-dimmed">{{ f.label }}</span>
          <span v-else class="truncate">
            {{ f.label }}
            <UBadge :label="String(modelValue.length)" size="sm" variant="subtle" class="ms-1" />
          </span>
        </template>
      </USelectMenu>

      <div class="ms-auto flex flex-wrap items-center gap-2">
        <slot name="toolbar" />

        <UDropdownMenu :items="visibilityItems" :content="{ align: 'end' }">
          <UButton label="表示列" color="neutral" variant="outline" icon="i-lucide-columns-3" class="hidden sm:inline-flex" />
        </UDropdownMenu>

        <template v-if="csv">
          <UTooltip v-if="!canExport" :text="`CSV 出力には「${permissionLabel(csv.permission!)}」権限が必要です`">
            <UButton label="CSV" icon="i-lucide-download" color="neutral" variant="outline" disabled />
          </UTooltip>
          <UFieldGroup v-else>
            <UButton label="CSV" icon="i-lucide-download" color="neutral" variant="outline" @click="exportRows('filtered')" />
            <UDropdownMenu :items="csvMenu" :content="{ align: 'end' }">
              <UButton icon="i-lucide-chevron-down" color="neutral" variant="outline" aria-label="CSV 出力オプション" />
            </UDropdownMenu>
          </UFieldGroup>
        </template>
      </div>
    </div>

    <!-- 絞り込み条件 -->
    <div v-if="hasConditions" class="flex flex-wrap items-center gap-1.5 text-sm">
      <span class="text-muted">絞り込み中：</span>
      <UBadge v-if="query.q" color="neutral" variant="subtle" class="gap-1">
        検索「{{ query.q }}」
        <UButton icon="i-lucide-x" size="xs" variant="link" color="neutral" class="-me-1 p-0" aria-label="解除" @click="search = ''" />
      </UBadge>
      <UBadge v-for="chip in activeFilterChips" :key="chip.key + chip.value" color="neutral" variant="subtle" class="gap-1">
        {{ chip.label }}
        <UButton icon="i-lucide-x" size="xs" variant="link" color="neutral" class="-me-1 p-0" aria-label="解除" @click="removeChip(chip.key, chip.value)" />
      </UBadge>
      <UButton label="すべてクリア" size="xs" variant="link" color="neutral" @click="resetQuery" />
      <span class="ms-auto text-muted tabular-nums">{{ filteredData.length.toLocaleString() }} / {{ data.length.toLocaleString() }} 件</span>
    </div>

    <!-- 一括操作 -->
    <div
      v-if="selectable && selectedRows.length"
      class="flex flex-wrap items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-sm"
    >
      <UIcon name="i-lucide-list-checks" class="size-4 text-primary" />
      <span class="font-medium text-highlighted">{{ selectedRows.length.toLocaleString() }} 件選択中</span>
      <UButton label="選択解除" size="xs" variant="link" color="neutral" @click="clearSelection" />
      <div class="ms-auto flex flex-wrap items-center gap-2">
        <slot name="bulk-actions" :selected="selectedRows" :clear="clearSelection" />
      </div>
    </div>

    <slot v-if="slots.summary" name="summary" :rows="processedRows" />

    <UTable
      ref="table"
      v-model:sorting="sorting"
      v-model:row-selection="rowSelection"
      v-model:column-visibility="columnVisibility"
      v-model:pagination="pagination"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
      :get-row-id="(row: T) => String(row[rowKey])"
      :data="filteredData"
      :columns="tableColumns"
      :loading="loading"
      :empty="emptyText"
      sticky
      class="min-h-0 flex-1"
      :ui="{
        base: 'border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        tr: clickable ? 'cursor-pointer hover:bg-elevated/40' : '',
        separator: 'h-0'
      }"
      @select="onSelectRow"
    />

    <!-- フッター -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-3">
      <div class="flex items-center gap-3 text-sm text-muted">
        <span class="tabular-nums">{{ rangeText }}</span>
        <USelect
          :model-value="pagination.pageSize"
          :items="[10, 20, 50, 100].map(n => ({ label: `${n} 件/頁`, value: n }))"
          size="sm"
          class="w-28"
          @update:model-value="(n: number) => pagination = { pageIndex: 0, pageSize: n }"
        />
      </div>
      <UPagination
        v-if="pageCount > 1"
        :page="pagination.pageIndex + 1"
        :items-per-page="pagination.pageSize"
        :total="filteredData.length"
        size="sm"
        @update:page="(p: number) => pagination = { ...pagination, pageIndex: p - 1 }"
      />
    </div>
  </div>
</template>
