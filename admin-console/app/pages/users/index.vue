<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { AdminUser } from '~/types'
import type { TableFilter } from '~/components/app/AppDataTable.vue'
import type { CsvColumn } from '~/utils/csv'
import { PERMISSION_TEMPLATES } from '~/utils/permissions'
import PermissionSummary from '~/components/permissions/PermissionSummary.vue'

definePageMeta({ permission: 'users.view' })
useHead({ title: 'ユーザー管理' })

const db = useMockDb()
const router = useRouter()
const { can } = usePermission()
const { setStatus } = useUserActions()
const { sortable, statusBadge, identity, UButton } = useTableColumns()
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UIcon = resolveComponent('UIcon')

const users = computed(() => db.value.users)

function rowMenu(user: AdminUser): DropdownMenuItem[][] {
  return [[
    { label: '詳細を表示', icon: 'i-lucide-file-text', to: `/users/${user.id}` },
    { label: '権限を編集', icon: 'i-lucide-shield-check', to: `/permissions?user=${user.id}`, disabled: !can('permissions.edit') }
  ], [
    user.status === 'suspended'
      ? { label: 'アカウントを再開', icon: 'i-lucide-rotate-ccw', disabled: !can('users.edit'), onSelect: () => setStatus([user], 'active') }
      : { label: 'アカウントを停止', icon: 'i-lucide-ban', color: 'error' as const, disabled: !can('users.edit'), onSelect: () => setStatus([user], 'suspended') }
  ]]
}

const columns: TableColumn<AdminUser>[] = [
  { accessorKey: 'name', header: sortable('ユーザー'), enableHiding: false, cell: ({ row }) => identity(row.original.name, row.original.email) },
  { accessorKey: 'department', header: sortable('部署 / 役職'), cell: ({ row }) => h('div', [h('p', { class: 'text-default' }, row.original.department), h('p', { class: 'text-xs text-muted' }, row.original.title)]) },
  { accessorKey: 'status', header: 'ステータス', cell: ({ row }) => statusBadge(USER_STATUS[row.original.status]) },
  { id: 'permissions', header: '権限', cell: ({ row }) => h(PermissionSummary, { user: row.original }) },
  {
    accessorKey: 'twoFactor',
    header: '2段階認証',
    meta: { class: { th: 'text-center', td: 'text-center' } },
    cell: ({ row }) => h(UIcon, { name: row.original.twoFactor ? 'i-lucide-shield-check' : 'i-lucide-shield-off', class: row.original.twoFactor ? 'size-4 text-success' : 'size-4 text-dimmed' })
  },
  {
    accessorKey: 'lastLoginAt',
    header: sortable('最終ログイン'),
    sortUndefined: 'last',
    cell: ({ row }) => h('span', { class: 'text-muted tabular-nums', title: formatDateTime(row.original.lastLoginAt) }, formatRelative(row.original.lastLoginAt))
  },
  {
    id: 'actions',
    enableHiding: false,
    meta: { class: { td: 'text-right w-12' } },
    cell: ({ row }) => h('div', { onClick: (e: Event) => e.stopPropagation() }, h(UDropdownMenu, { items: rowMenu(row.original), content: { align: 'end' } }, () =>
      h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost', 'aria-label': '操作' })))
  }
]

const filters: TableFilter<AdminUser>[] = [
  { key: 'status', label: 'ステータス', icon: 'i-lucide-circle-dot', options: toOptions(USER_STATUS) },
  { key: 'department', label: '部署', icon: 'i-lucide-building-2', options: [...new Set(db.value.users.map(u => u.department))].map(d => ({ label: d, value: d })) },
  { key: 'templateId', label: '権限テンプレート', icon: 'i-lucide-shield', options: PERMISSION_TEMPLATES.map(t => ({ label: t.label, value: t.id })) },
  {
    key: 'permission',
    label: '保有権限',
    icon: 'i-lucide-key-round',
    options: ALL_PERMISSIONS.map(p => ({ label: permissionLabel(p), value: p })),
    match: (row, values) => values.every(v => (row.permissions as string[]).includes(v))
  }
]

const csvColumns: CsvColumn<AdminUser>[] = [
  { header: 'ユーザーID', key: 'id' },
  { header: '氏名', key: 'name' },
  { header: 'メールアドレス', key: 'email' },
  { header: '部署', key: 'department' },
  { header: '役職', key: 'title' },
  { header: 'ステータス', value: r => USER_STATUS[r.status].label },
  { header: '権限テンプレート', value: r => findTemplate(r.templateId)?.label ?? '' },
  { header: 'カスタム', value: r => (matchesTemplate(r.permissions, r.templateId) ? '' : '○') },
  { header: '権限', value: r => r.permissions.join(' ') },
  { header: '2段階認証', value: r => (r.twoFactor ? '有効' : '無効') },
  { header: '最終ログイン', value: r => formatDateTime(r.lastLoginAt) },
  { header: '登録日', value: r => formatDate(r.createdAt) }
]

const stats = computed(() => [
  { label: '全ユーザー', value: users.value.length, icon: 'i-lucide-users' },
  { label: '有効', value: users.value.filter(u => u.status === 'active').length, icon: 'i-lucide-circle-check' },
  { label: '招待中', value: users.value.filter(u => u.status === 'invited').length, icon: 'i-lucide-mail' },
  { label: '2段階認証 未設定', value: users.value.filter(u => !u.twoFactor && u.status !== 'suspended').length, icon: 'i-lucide-shield-alert' }
])
</script>

<template>
  <AppPage id="users" title="ユーザー管理">
    <template #actions>
      <AppCan permission="users.edit">
        <UserInviteModal />
      </AppCan>
    </template>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="s in stats" :key="s.label" class="flex items-center gap-3 rounded-lg border border-default px-4 py-3">
        <UIcon :name="s.icon" class="size-5 text-muted" />
        <div>
          <p class="text-xs text-muted">
            {{ s.label }}
          </p>
          <p class="text-lg font-semibold text-highlighted tabular-nums">
            {{ s.value }}
          </p>
        </div>
      </div>
    </div>

    <AppDataTable
      :data="users"
      :columns="columns"
      :filters="filters"
      :search-keys="['name', 'email', 'id', 'title']"
      search-placeholder="氏名・メール・ID で検索…"
      :csv="{ filename: 'admin_users', columns: csvColumns, permission: 'users.export', label: 'ユーザー一覧' }"
      :column-labels="{ name: 'ユーザー', department: '部署 / 役職', status: 'ステータス', permissions: '権限', twoFactor: '2段階認証', lastLoginAt: '最終ログイン' }"
      :initial-sorting="[{ id: 'lastLoginAt', desc: true }]"
      selectable
      clickable
      @row-click="(u) => router.push(`/users/${u.id}`)"
    >
      <template #bulk-actions="{ selected, clear }">
        <AppCan permission="users.edit" mode="disable">
          <UButton label="再開" icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="outline" @click="setStatus(selected, 'active').then(ok => ok && clear())" />
        </AppCan>
        <AppCan permission="users.edit" mode="disable">
          <UButton label="停止" icon="i-lucide-ban" size="sm" color="error" variant="soft" @click="setStatus(selected, 'suspended').then(ok => ok && clear())" />
        </AppCan>
      </template>
    </AppDataTable>
  </AppPage>
</template>
