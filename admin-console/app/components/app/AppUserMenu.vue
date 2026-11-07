<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{ collapsed?: boolean }>()

const colorMode = useColorMode()
const db = useMockDb()
const { currentUser, switchUser } = useSession()
const toast = useToast()
const router = useRouter()
const { can } = usePermission()

/** 権限の出し分けを確認するためのモック用ログイン切替（テンプレートごとに代表者を 1 名ずつ） */
const switchCandidates = computed(() => {
  const picked = new Map<string, typeof db.value.users[number]>()
  for (const u of db.value.users) {
    if (u.status === 'active' && u.templateId && !picked.has(u.templateId)) picked.set(u.templateId, u)
  }
  return [...picked.values()]
})

const items = computed<DropdownMenuItem[][]>(() => [[{
  type: 'label',
  label: currentUser.value.name,
  description: currentUser.value.email,
  avatar: { alt: currentUser.value.name }
}], [{
  label: 'プロフィール',
  icon: 'i-lucide-user',
  to: `/users/${currentUser.value.id}`,
  disabled: !can('users.view')
}, {
  label: '表示モード',
  icon: 'i-lucide-sun-moon',
  children: [
    { label: 'ライト', icon: 'i-lucide-sun', type: 'checkbox', checked: colorMode.preference === 'light', onSelect: (e: Event) => { e.preventDefault(); colorMode.preference = 'light' } },
    { label: 'ダーク', icon: 'i-lucide-moon', type: 'checkbox', checked: colorMode.preference === 'dark', onSelect: (e: Event) => { e.preventDefault(); colorMode.preference = 'dark' } },
    { label: 'システム設定に従う', icon: 'i-lucide-monitor', type: 'checkbox', checked: colorMode.preference === 'system', onSelect: (e: Event) => { e.preventDefault(); colorMode.preference = 'system' } }
  ]
}, {
  label: 'ログインユーザー切替（モック）',
  icon: 'i-lucide-repeat',
  children: switchCandidates.value.map(u => ({
    label: u.name,
    description: findTemplate(u.templateId)?.label,
    type: 'checkbox' as const,
    checked: u.id === currentUser.value.id,
    onSelect: () => {
      switchUser(u.id)
      toast.add({ title: `${u.name} としてログインしました`, description: `権限：${findTemplate(u.templateId)?.label}（${u.permissions.length} 件）`, icon: 'i-lucide-repeat' })
      router.push(firstAccessiblePath(p => !p || u.permissions.includes(p)) ?? '/forbidden')
    }
  }))
}], [{
  label: 'ログアウト',
  icon: 'i-lucide-log-out',
  onSelect: () => toast.add({ title: 'モックのためログアウトは行いません', icon: 'i-lucide-info' })
}]])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-60' : 'w-(--reka-dropdown-menu-trigger-width) min-w-60' }"
  >
    <UButton
      :avatar="{ alt: currentUser.name }"
      :label="collapsed ? undefined : currentUser.name"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
