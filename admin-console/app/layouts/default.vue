<script setup lang="ts">
import type { AppNavItem } from '~/utils/navigation'
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const { can } = usePermission()
const router = useRouter()

function toMenuItems(items: AppNavItem[]): NavigationMenuItem[] {
  return items.map(item => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
    badge: item.badge,
    defaultOpen: !!item.children,
    type: item.children ? 'trigger' : undefined,
    children: item.children ? toMenuItems(item.children) : undefined,
    onSelect: () => { open.value = false }
  }))
}

// 権限に応じてメニューを出し分け
const mainLinks = computed(() => toMenuItems(filterNavigation(MAIN_NAVIGATION, can)))
const secondaryLinks = computed(() => toMenuItems(filterNavigation(SECONDARY_NAVIGATION, can)))

// コマンドパレット（⌘K）
const searchGroups = computed(() => [{
  id: 'pages',
  label: '画面へ移動',
  items: filterNavigation(MAIN_NAVIGATION, can)
    .flatMap(i => i.children ? i.children.map(c => ({ ...c, label: `${i.label} / ${c.label}` })) : [i])
    .map(i => ({ label: i.label, icon: i.icon, to: i.to }))
}])

defineShortcuts({
  'g-d': () => router.push('/'),
  'g-u': () => router.push('/users'),
  'g-p': () => router.push('/permissions')
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      :default-size="15"
      :min-size="12"
      :max-size="20"
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <AppBrand :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" label="検索…" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="mainLinks"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="secondaryLinks"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <AppUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="searchGroups" placeholder="画面を検索…" />

    <slot />
  </UDashboardGroup>
</template>
