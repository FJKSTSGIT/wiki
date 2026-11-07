<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AdminUser } from '~/types'
import type { CsvColumn } from '~/utils/csv'
import { ALL_PERMISSIONS, HIGH_RISK_PERMISSIONS, PERMISSION_RESOURCES, PERMISSION_TEMPLATES } from '~/utils/permissions'
import type { PermissionKey } from '~/utils/permissions'

definePageMeta({ permission: 'permissions.view' })
useHead({ title: '権限管理' })

const route = useRoute()
const router = useRouter()
const db = useMockDb()
const toast = useToast()
const confirm = useConfirm()
const { can } = usePermission()
const { currentUser } = useSession()
const { record } = useAuditLog()
const { exportCsv } = useCsvExport()

const view = ref<'user' | 'permission'>('user')
const viewTabs = [
  { label: 'ユーザー別に設定', value: 'user', icon: 'i-lucide-user-cog' },
  { label: '権限別に確認', value: 'permission', icon: 'i-lucide-key-round' }
]

/* ---------------- ユーザー選択 ---------------- */
const userSearch = ref('')
const listUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  return db.value.users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.includes(q) || u.department.includes(q))
})

const selectedId = ref<string>((route.query.user as string) || db.value.users[1]?.id || db.value.users[0]!.id)
const selectedUser = computed(() => db.value.users.find(u => u.id === selectedId.value))

/* ---------------- 編集中の権限 ---------------- */
const draft = ref<PermissionKey[]>([])
watch(selectedUser, (u) => { draft.value = [...(u?.permissions ?? [])] }, { immediate: true })

const added = computed(() => draft.value.filter(p => !selectedUser.value?.permissions.includes(p)))
const removed = computed(() => (selectedUser.value?.permissions ?? []).filter(p => !draft.value.includes(p)))
const dirty = computed(() => added.value.length + removed.value.length > 0)

const isSelf = computed(() => selectedUser.value?.id === currentUser.value.id)
const editable = computed(() => can('permissions.edit'))
// 自分自身の権限管理権限は外せない（誤操作で誰も権限を管理できなくなるのを防ぐ）
const locked = computed<PermissionKey[]>(() => isSelf.value ? ['permissions.view', 'permissions.edit'] : [])

async function selectUser(id: string) {
  if (id === selectedId.value) return
  if (dirty.value) {
    const ok = await confirm({ title: '変更を破棄しますか？', description: '保存されていない権限の変更があります。', confirmLabel: '破棄して移動', color: 'warning' })
    if (!ok) return
  }
  selectedId.value = id
  router.replace({ query: { ...route.query, user: id } })
}

function applyTemplate(templateId: string) {
  const t = findTemplate(templateId)
  if (!t) return
  draft.value = normalizePermissions([...t.permissions, ...locked.value])
  toast.add({ title: `テンプレート「${t.label}」を適用しました`, description: '保存するまで反映されません', icon: 'i-lucide-layers' })
}

function copyFrom(userId: string) {
  const u = db.value.users.find(x => x.id === userId)
  if (!u) return
  draft.value = normalizePermissions([...u.permissions, ...locked.value])
  toast.add({ title: `${u.name} の権限をコピーしました`, description: '保存するまで反映されません', icon: 'i-lucide-copy' })
}

const templateMenu = computed(() => [PERMISSION_TEMPLATES.map(t => ({
  label: t.label,
  description: t.description,
  onSelect: () => applyTemplate(t.id)
}))])
const copyCandidates = computed(() => db.value.users
  .filter(u => u.id !== selectedId.value)
  .map(u => ({ label: u.name, value: u.id, description: findTemplate(u.templateId)?.label })))

async function save() {
  const user = selectedUser.value
  if (!user) return
  const riskyAdded = added.value.filter(p => HIGH_RISK_PERMISSIONS.includes(p))
  const ok = await confirm({
    title: `${user.name} の権限を変更しますか？`,
    description: riskyAdded.length ? '高リスクの権限が含まれています。付与内容をよく確認してください。' : '変更は即時反映され、操作ログに記録されます。',
    color: riskyAdded.length ? 'error' : 'primary',
    confirmLabel: '変更を保存',
    confirmText: riskyAdded.length ? '変更する' : undefined,
    details: [
      ...added.value.map(p => ({ label: `＋ ${permissionLabel(p)}`, value: HIGH_RISK_PERMISSIONS.includes(p) ? '高リスク' : '', color: 'success' as const })),
      ...removed.value.map(p => ({ label: `− ${permissionLabel(p)}`, color: 'error' as const }))
    ]
  })
  if (!ok) return

  const target = db.value.users.find(u => u.id === user.id)!
  const addedCount = added.value.length
  const removedCount = removed.value.length
  const detail = [...added.value.map(p => `+ ${p}`), ...removed.value.map(p => `- ${p}`)].join(', ')
  target.permissions = [...draft.value]
  record({ category: 'permission', action: '権限を変更', target: target.name, detail })
  toast.add({ title: '権限を保存しました', description: `${target.name}：追加 ${addedCount} / 削除 ${removedCount}`, color: 'success', icon: 'i-lucide-shield-check' })
  draft.value = [...target.permissions]
}

function discard() {
  draft.value = [...(selectedUser.value?.permissions ?? [])]
}

/** 編集中の権限で表示されるメニューのプレビュー */
const menuPreview = computed(() => {
  const set = new Set(draft.value)
  const canDraft = (p?: PermissionKey) => !p || set.has(p)
  const visible = new Set(filterNavigation(MAIN_NAVIGATION, canDraft).flatMap(i => [i.label, ...(i.children?.map(c => c.label) ?? [])]))
  return MAIN_NAVIGATION.flatMap(i => i.children ? i.children.map(c => ({ ...c, label: `${i.label} / ${c.label}` })) : [i])
    .map(i => ({ ...i, visible: visible.has(i.label.split(' / ').pop()!) }))
})

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true
  return await confirm({ title: '変更を破棄しますか？', description: '保存されていない権限の変更があります。', confirmLabel: '破棄して移動', color: 'warning' })
})

/* ---------------- 権限別ビュー ---------------- */
interface PermissionRow {
  key: PermissionKey
  label: string
  resource: string
  risk: boolean
  users: AdminUser[]
}
const permissionRows = computed<PermissionRow[]>(() => ALL_PERMISSIONS.map(key => ({
  key,
  label: permissionLabel(key),
  resource: PERMISSION_RESOURCES.find(r => key.startsWith(`${r.key}.`))!.label,
  risk: HIGH_RISK_PERMISSIONS.includes(key),
  users: db.value.users.filter(u => u.status !== 'suspended' && u.permissions.includes(key))
})))

const { sortable } = useTableColumns()
const UAvatarGroup = resolveComponent('UAvatarGroup')
const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')

const permissionColumns: TableColumn<PermissionRow>[] = [
  { accessorKey: 'label', header: sortable('権限'), cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
    h('span', { class: 'font-medium text-highlighted' }, row.original.label),
    row.original.risk ? h(UBadge, { label: '高リスク', color: 'error', variant: 'subtle', size: 'sm' }) : null
  ]) },
  { accessorKey: 'key', header: 'キー', cell: ({ row }) => h('code', { class: 'text-xs text-muted' }, row.original.key) },
  { id: 'count', accessorFn: r => r.users.length, header: sortable('付与ユーザー数'), cell: ({ row }) => h('span', { class: 'tabular-nums' }, `${row.original.users.length} 名`) },
  { id: 'users', header: 'ユーザー', cell: ({ row }) => h(UAvatarGroup, { max: 8, size: 'sm' }, () => row.original.users.map(u => h(UAvatar, { alt: u.name, key: u.id, title: u.name }))) }
]

const permissionCsv: CsvColumn<PermissionRow>[] = [
  { header: '権限キー', key: 'key' },
  { header: '権限', key: 'label' },
  { header: '機能', key: 'resource' },
  { header: '高リスク', value: r => (r.risk ? '○' : '') },
  { header: '付与ユーザー数', value: r => r.users.length },
  { header: '付与ユーザー', value: r => r.users.map(u => u.name) }
]

/** 監査用：ユーザー × 権限のマトリクスを CSV 出力 */
function exportMatrix() {
  const columns: CsvColumn<AdminUser>[] = [
    { header: 'ユーザーID', key: 'id' },
    { header: '氏名', key: 'name' },
    { header: 'メールアドレス', key: 'email' },
    { header: 'ステータス', value: r => USER_STATUS[r.status].label },
    { header: '権限テンプレート', value: r => findTemplate(r.templateId)?.label ?? '' },
    ...ALL_PERMISSIONS.map(p => ({ header: permissionLabel(p), value: (r: AdminUser) => (r.permissions.includes(p) ? '○' : '') }))
  ]
  exportCsv(db.value.users, { filename: 'permission_matrix', columns, label: '権限マトリクス', permission: 'permissions.view' })
}
</script>

<template>
  <AppPage id="permissions" title="権限管理">
    <template #toolbar>
      <UTabs v-model="view" :items="viewTabs" :content="false" variant="link" size="sm" class="-mb-px" :ui="{ trigger: 'py-3' }" />
    </template>
    <template #toolbar-right>
      <UButton label="権限マトリクス CSV" icon="i-lucide-sheet" color="neutral" variant="outline" size="sm" @click="exportMatrix" />
    </template>

    <UAlert
      v-if="!editable"
      icon="i-lucide-lock"
      color="neutral"
      variant="subtle"
      title="閲覧のみ"
      description="権限を変更するには「権限管理：編集」権限が必要です。"
    />

    <!-- ユーザー別 -->
    <div v-if="view === 'user'" class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[18rem_1fr] sm:gap-6">
      <UCard :ui="{ root: 'flex flex-col lg:max-h-[calc(100vh-12rem)]', header: 'p-3 sm:p-3', body: 'p-0 sm:p-0 overflow-y-auto flex-1' }">
        <template #header>
          <UInput v-model="userSearch" icon="i-lucide-search" placeholder="ユーザーを検索…" class="w-full" />
        </template>
        <ul class="divide-y divide-default">
          <li v-for="u in listUsers" :key="u.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-elevated/50"
              :class="u.id === selectedId ? 'bg-primary/10 hover:bg-primary/10' : ''"
              @click="selectUser(u.id)"
            >
              <UAvatar :alt="u.name" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ u.name }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ findTemplate(u.templateId)?.label }}{{ matchesTemplate(u.permissions, u.templateId) ? '' : '（カスタム）' }}
                </p>
              </div>
              <UBadge v-if="u.status !== 'active'" :label="USER_STATUS[u.status].label" :color="USER_STATUS[u.status].color" variant="subtle" size="sm" />
            </button>
          </li>
        </ul>
      </UCard>

      <div v-if="selectedUser" class="flex min-w-0 flex-col gap-4">
        <UCard>
          <div class="flex flex-wrap items-center gap-4">
            <UAvatar :alt="selectedUser.name" size="xl" />
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 font-semibold text-highlighted">
                {{ selectedUser.name }}
                <UBadge v-if="isSelf" label="あなた" size="sm" variant="subtle" />
              </p>
              <p class="text-sm text-muted">
                {{ selectedUser.email }} ・ {{ selectedUser.department }}
              </p>
            </div>
            <div v-if="editable" class="flex flex-wrap gap-2">
              <UDropdownMenu :items="templateMenu" :content="{ align: 'end' }" :ui="{ content: 'w-64' }">
                <UButton label="テンプレートを適用" icon="i-lucide-layers" color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" />
              </UDropdownMenu>
              <USelectMenu
                :items="copyCandidates"
                value-key="value"
                :model-value="undefined"
                placeholder="他ユーザーからコピー"
                icon="i-lucide-copy"
                :search-input="{ placeholder: 'ユーザーを検索…' }"
                class="w-52"
                @update:model-value="(id: string) => copyFrom(id)"
              />
            </div>
          </div>
        </UCard>

        <UAlert
          v-if="isSelf && editable"
          icon="i-lucide-info"
          color="info"
          variant="subtle"
          description="自分自身の「権限管理」権限は外せません（管理者不在を防ぐため）。"
        />

        <div class="grid gap-4 xl:grid-cols-[1fr_16rem]">
          <PermissionMatrix
            v-model="draft"
            :original="selectedUser.permissions"
            :readonly="!editable"
            :locked="locked"
          />

          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="mb-1 text-sm font-semibold text-highlighted">
              表示されるメニュー
            </p>
            <p class="mb-3 text-xs text-muted">
              編集中の権限でのサイドバー表示
            </p>
            <ul class="space-y-1.5 text-sm">
              <li v-for="m in menuPreview" :key="m.label" class="flex items-center gap-2" :class="m.visible ? 'text-highlighted' : 'text-dimmed line-through'">
                <UIcon :name="m.visible ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="size-3.5 shrink-0" :class="m.visible ? 'text-success' : ''" />
                <span class="truncate">{{ m.label }}</span>
              </li>
            </ul>
          </UCard>
        </div>

        <!-- 変更の保存バー -->
        <div
          v-if="editable"
          class="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-lg border bg-default/95 px-4 py-3 backdrop-blur"
          :class="dirty ? 'border-primary/40 shadow-lg' : 'border-default'"
        >
          <template v-if="dirty">
            <UIcon name="i-lucide-pencil-line" class="size-4 text-primary" />
            <span class="text-sm text-highlighted">未保存の変更</span>
            <UBadge v-if="added.length" :label="`+${added.length} 追加`" color="success" variant="subtle" />
            <UBadge v-if="removed.length" :label="`−${removed.length} 削除`" color="error" variant="subtle" />
          </template>
          <span v-else class="text-sm text-muted">変更はありません</span>
          <div class="ms-auto flex gap-2">
            <UButton label="元に戻す" color="neutral" variant="ghost" :disabled="!dirty" @click="discard" />
            <UButton label="変更を保存" icon="i-lucide-save" :disabled="!dirty" @click="save" />
          </div>
        </div>
      </div>
    </div>

    <!-- 権限別 -->
    <AppDataTable
      v-else
      :data="permissionRows"
      :columns="permissionColumns"
      row-key="key"
      :search-keys="['label', 'key', 'resource']"
      search-placeholder="権限名・キーで検索…"
      :filters="[
        { key: 'resource', label: '機能', options: PERMISSION_RESOURCES.map(r => ({ label: r.label, value: r.label })) },
        { key: 'risk', label: 'リスク', options: [{ label: '高リスクのみ', value: 'true' }] }
      ]"
      :csv="{ filename: 'permissions', columns: permissionCsv, label: '権限別付与状況' }"
      :column-labels="{ label: '権限', key: 'キー', count: '付与ユーザー数', users: 'ユーザー' }"
      :page-size="50"
    />
  </AppPage>
</template>
