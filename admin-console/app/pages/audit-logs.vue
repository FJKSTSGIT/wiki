<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AuditLog } from '~/types'
import type { TableFilter } from '~/components/app/AppDataTable.vue'
import type { CsvColumn } from '~/utils/csv'

definePageMeta({ permission: 'auditLogs.view' })
useHead({ title: '操作ログ' })

const db = useMockDb()
const { sortable, statusBadge } = useTableColumns()
const UAvatar = resolveComponent('UAvatar')

const columns: TableColumn<AuditLog>[] = [
  { accessorKey: 'createdAt', header: sortable('日時'), cell: ({ row }) => h('span', { class: 'tabular-nums whitespace-nowrap' }, formatDateTime(row.original.createdAt)) },
  { accessorKey: 'actorName', header: sortable('実行者'), cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [h(UAvatar, { alt: row.original.actorName, size: 'xs' }), h('span', { class: 'text-highlighted' }, row.original.actorName)]) },
  { accessorKey: 'category', header: '種別', cell: ({ row }) => statusBadge(AUDIT_CATEGORY[row.original.category]) },
  { accessorKey: 'action', header: '操作', cell: ({ row }) => h('span', { class: 'text-highlighted' }, row.original.action) },
  { accessorKey: 'target', header: '対象' },
  { accessorKey: 'detail', header: '詳細', cell: ({ row }) => h('span', { class: 'text-muted' }, row.original.detail ?? '') }
]

const filters: TableFilter<AuditLog>[] = [
  { key: 'category', label: '種別', icon: 'i-lucide-tag', options: toOptions(AUDIT_CATEGORY) },
  { key: 'actorId', label: '実行者', icon: 'i-lucide-user', options: db.value.users.map(u => ({ label: u.name, value: u.id })) }
]

const csvColumns: CsvColumn<AuditLog>[] = [
  { header: 'ログID', key: 'id' },
  { header: '日時', value: r => formatDateTime(r.createdAt) },
  { header: '実行者ID', key: 'actorId' },
  { header: '実行者', key: 'actorName' },
  { header: '種別', value: r => AUDIT_CATEGORY[r.category].label },
  { header: '操作', key: 'action' },
  { header: '対象', key: 'target' },
  { header: '詳細', key: 'detail' }
]
</script>

<template>
  <AppPage id="audit-logs" title="操作ログ">
    <AppDataTable
      :data="db.auditLogs"
      :columns="columns"
      :filters="filters"
      :search-keys="['actorName', 'action', 'target', 'detail']"
      search-placeholder="実行者・操作・対象で検索…"
      :csv="{ filename: 'audit_logs', columns: csvColumns, permission: 'auditLogs.export', label: '操作ログ' }"
      :column-labels="{ createdAt: '日時', actorName: '実行者', category: '種別', action: '操作', target: '対象', detail: '詳細' }"
      :initial-sorting="[{ id: 'createdAt', desc: true }]"
      :page-size="50"
    />
  </AppPage>
</template>
