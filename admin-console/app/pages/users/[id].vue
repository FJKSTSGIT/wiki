<script setup lang="ts">
definePageMeta({ permission: 'users.view' })

const route = useRoute()
const db = useMockDb()
const { can } = usePermission()
const { currentUser } = useSession()
const { setStatus } = useUserActions()

const user = computed(() => db.value.users.find(u => u.id === route.params.id))
useHead({ title: () => user.value?.name ?? 'ユーザー詳細' })

const template = computed(() => findTemplate(user.value?.templateId))
const logs = computed(() => db.value.auditLogs.filter(l => l.actorId === user.value?.id).slice(0, 8))
const isSelf = computed(() => user.value?.id === currentUser.value.id)

const profile = computed(() => user.value
  ? [
      { label: 'ユーザーID', value: user.value.id },
      { label: 'メールアドレス', value: user.value.email },
      { label: '部署', value: user.value.department },
      { label: '役職', value: user.value.title },
      { label: '2段階認証', value: user.value.twoFactor ? '有効' : '未設定' },
      { label: '最終ログイン', value: formatDateTime(user.value.lastLoginAt) },
      { label: '登録日', value: formatDate(user.value.createdAt) }
    ]
  : [])

const tabs = [
  { label: '権限', value: 'permissions', icon: 'i-lucide-shield-check', slot: 'permissions' as const },
  { label: '操作履歴', value: 'activity', icon: 'i-lucide-history', slot: 'activity' as const }
]
</script>

<template>
  <AppPage id="user-detail" :title="user?.name ?? 'ユーザー詳細'" narrow>
    <template #leading>
      <UButton to="/users" icon="i-lucide-arrow-left" color="neutral" variant="ghost" square aria-label="一覧へ戻る" class="hidden lg:inline-flex" />
    </template>

    <template v-if="user" #actions>
      <AppCan permission="permissions.edit">
        <UButton :to="`/permissions?user=${user.id}`" label="権限を編集" icon="i-lucide-shield-check" color="neutral" variant="outline" />
      </AppCan>
      <AppCan v-if="!isSelf" permission="users.edit">
        <UButton
          v-if="user.status === 'suspended'"
          label="再開"
          icon="i-lucide-rotate-ccw"
          @click="setStatus([user], 'active')"
        />
        <UButton
          v-else
          label="停止"
          icon="i-lucide-ban"
          color="error"
          variant="soft"
          @click="setStatus([user], 'suspended')"
        />
      </AppCan>
    </template>

    <UEmpty
      v-if="!user"
      icon="i-lucide-user-x"
      title="ユーザーが見つかりません"
      :description="`ID: ${route.params.id}`"
      :actions="[{ label: '一覧へ戻る', to: '/users', icon: 'i-lucide-arrow-left' }]"
    />

    <template v-else>
      <UAlert
        v-if="user.status === 'suspended'"
        icon="i-lucide-ban"
        color="error"
        variant="subtle"
        title="このアカウントは停止中です"
        description="ログインできません。権限設定は保持されています。"
      />

      <div class="grid gap-4 lg:grid-cols-3 sm:gap-6">
        <UCard class="lg:col-span-1">
          <div class="flex flex-col items-center gap-3 pb-4 text-center">
            <UAvatar :alt="user.name" size="3xl" />
            <div>
              <p class="text-lg font-semibold text-highlighted">
                {{ user.name }}
                <UBadge v-if="isSelf" label="あなた" size="sm" variant="subtle" class="ms-1 align-middle" />
              </p>
              <p class="text-sm text-muted">
                {{ user.department }} ・ {{ user.title }}
              </p>
            </div>
            <div class="flex flex-wrap justify-center gap-1.5">
              <UBadge :label="USER_STATUS[user.status].label" :color="USER_STATUS[user.status].color" :icon="USER_STATUS[user.status].icon" variant="subtle" />
              <PermissionSummary :user="user" />
            </div>
          </div>
          <USeparator />
          <dl class="divide-y divide-default text-sm">
            <div v-for="p in profile" :key="p.label" class="flex justify-between gap-4 py-2.5">
              <dt class="text-muted">
                {{ p.label }}
              </dt>
              <dd class="truncate text-right text-highlighted tabular-nums">
                {{ p.value }}
              </dd>
            </div>
          </dl>
        </UCard>

        <div class="lg:col-span-2">
          <UTabs :items="tabs" default-value="permissions" variant="link" class="gap-4" :ui="{ list: 'border-b border-default' }">
            <template #permissions>
              <div class="space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p class="text-muted">
                    適用テンプレート：<span class="font-medium text-highlighted">{{ template?.label ?? '未設定' }}</span>
                    <span v-if="!matchesTemplate(user.permissions, user.templateId)" class="text-warning">（個別に変更あり）</span>
                  </p>
                  <span class="text-muted tabular-nums">{{ user.permissions.length }} 件の権限</span>
                </div>
                <PermissionMatrix :model-value="user.permissions" readonly />
                <p v-if="!can('permissions.edit')" class="text-xs text-muted">
                  権限の変更には「権限管理：編集」権限が必要です。
                </p>
              </div>
            </template>

            <template #activity>
              <UCard v-if="can('auditLogs.view')" :ui="{ body: 'p-0 sm:p-0' }">
                <ul v-if="logs.length" class="divide-y divide-default">
                  <li v-for="l in logs" :key="l.id" class="flex items-start gap-3 px-4 py-3 text-sm">
                    <UIcon :name="AUDIT_CATEGORY[l.category].icon!" class="mt-0.5 size-4 shrink-0 text-muted" />
                    <div class="min-w-0 flex-1">
                      <p class="text-highlighted">
                        {{ l.action }} <span class="text-muted">— {{ l.target }}</span>
                      </p>
                      <p v-if="l.detail" class="text-xs text-muted">
                        {{ l.detail }}
                      </p>
                    </div>
                    <span class="shrink-0 text-xs text-muted tabular-nums">{{ formatDateTime(l.createdAt) }}</span>
                  </li>
                </ul>
                <UEmpty v-else icon="i-lucide-history" title="操作履歴はありません" variant="naked" class="py-10" />
              </UCard>
              <UAlert v-else icon="i-lucide-lock" color="neutral" variant="subtle" title="操作履歴の閲覧には「操作ログ：閲覧」権限が必要です" />
            </template>
          </UTabs>
        </div>
      </div>
    </template>
  </AppPage>
</template>
