<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~/utils/mock'

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')
const toast = useToast()

const q = ref('')
const status = ref<'all' | User['status']>('all')
const role = ref('all')
const page = ref(1)
const PER = 15

const filtered = computed(() => USERS.filter(u =>
  (status.value === 'all' || u.status === status.value)
  && (role.value === 'all' || u.role === role.value)
  && (!q.value || u.name.includes(q.value) || u.email.includes(q.value))
))
const rows = computed(() => filtered.value.slice((page.value - 1) * PER, page.value * PER))
watch([q, status, role], () => { page.value = 1 })

const rowSelection = ref({})

const columns: TableColumn<User>[] = [
  { id: 'select', header: ({ table }) => h(resolveComponent('UCheckbox'), { 'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(), 'onUpdate:modelValue': (v: boolean) => table.toggleAllPageRowsSelected(!!v) }), cell: ({ row }) => h(resolveComponent('UCheckbox'), { 'modelValue': row.getIsSelected(), 'onUpdate:modelValue': (v: boolean) => row.toggleSelected(!!v) }) },
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => h('span', { class: 'font-mono text-xs text-muted' }, `#${row.original.id}`) },
  {
    accessorKey: 'name', header: 'ユーザー',
    cell: ({ row }) => h(resolveComponent('NuxtLink'), { to: `/users/${row.original.id}`, class: 'flex items-center gap-3 group' }, () => [
      h(UAvatar, { text: row.original.name[0], size: 'sm' }),
      h('div', [h('p', { class: 'text-highlighted group-hover:underline' }, row.original.name), h('p', { class: 'text-xs text-muted' }, row.original.email)])
    ])
  },
  { accessorKey: 'role', header: 'ロール', cell: ({ row }) => roleName(row.original.role) },
  { accessorKey: 'status', header: 'ステータス', cell: ({ row }) => h(UBadge, { color: USER_STATUS[row.original.status].color, variant: 'subtle' }, () => USER_STATUS[row.original.status].label) },
  { accessorKey: 'mfa', header: 'MFA', cell: ({ row }) => h(UIcon, { name: row.original.mfa ? 'i-lucide-shield-check' : 'i-lucide-shield-off', class: row.original.mfa ? 'text-success size-4' : 'text-dimmed size-4' }) },
  { accessorKey: 'orders', header: '注文数', meta: { class: { td: 'text-right tabular-nums', th: 'text-right' } } },
  { accessorKey: 'lastLogin', header: '最終ログイン', cell: ({ row }) => h('span', { class: 'text-muted text-xs' }, fmtDate(row.original.lastLogin)) },
  {
    id: 'actions', meta: { class: { td: 'text-right' } },
    cell: ({ row }) => h(UDropdownMenu, {
      content: { align: 'end' },
      items: [[
        { label: '詳細', icon: 'i-lucide-eye', to: `/users/${row.original.id}` },
        { label: 'パスワードリセット送信', icon: 'i-lucide-key-round', onSelect: () => toast.add({ title: 'リセットメールを送信しました', description: row.original.email }) }
      ], [
        { label: '利用停止', icon: 'i-lucide-ban', color: 'error', onSelect: () => toast.add({ title: `${row.original.name} を停止しました`, color: 'error' }) }
      ]]
    }, () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost', size: 'sm' }))
  }
]
const selectedCount = computed(() => Object.keys(rowSelection.value).length)
</script>

<template>
  <PageShell id="users" title="ユーザー一覧" icon="i-lucide-users" :description="`${filtered.length} 件`">
    <template #actions>
      <UButton icon="i-lucide-upload" color="neutral" variant="outline" size="sm" label="CSV取込" />
      <UButton icon="i-lucide-user-plus" size="sm" label="ユーザーを招待" to="/users/invitations" />
    </template>
    <template #toolbar>
      <div class="flex items-center gap-2 w-full">
        <UInput v-model="q" icon="i-lucide-search" placeholder="名前・メールで検索" class="w-72" size="sm" />
        <USelect v-model="status" size="sm" class="w-32" :items="[{ label: 'すべて', value: 'all' }, { label: '有効', value: 'active' }, { label: '招待中', value: 'invited' }, { label: '停止', value: 'suspended' }]" />
        <USelect v-model="role" size="sm" class="w-36" :items="[{ label: '全ロール', value: 'all' }, ...ROLES.map(r => ({ label: r.name, value: r.id as string }))]" />
        <div class="flex-1" />
        <template v-if="selectedCount">
          <span class="text-sm text-muted">{{ selectedCount }} 件選択中</span>
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-user-cog" label="ロール変更" />
          <UButton size="sm" color="error" variant="soft" icon="i-lucide-ban" label="停止" />
        </template>
      </div>
    </template>

    <UTable v-model:row-selection="rowSelection" :data="rows" :columns="columns" :get-row-id="(r: User) => String(r.id)" class="border border-default rounded-lg" />
    <div class="flex items-center justify-between mt-4 text-sm text-muted">
      <span>{{ (page - 1) * PER + 1 }}–{{ Math.min(page * PER, filtered.length) }} / {{ filtered.length }}</span>
      <UPagination v-model:page="page" :total="filtered.length" :items-per-page="PER" size="sm" />
    </div>
  </PageShell>
</template>
