<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui'
const route = useRoute()
const { current } = useAppEnv()

useHead({ htmlAttrs: { 'data-env': current } })
useHead({ titleTemplate: t => `${t ? t + ' · ' : ''}[${current.value.toUpperCase()}] Hatchery Admin` })

const mainItems = computed(() => toMenuItems(NAV_MAIN, route.path))
const footerItems = computed(() => toMenuItems(NAV_FOOTER, route.path))

const searchGroups = computed(() => [{
  id: 'pages',
  label: 'ページ',
  items: [...NAV_MAIN, ...NAV_FOOTER].flatMap<CommandPaletteItem>(n =>
    n.children ? n.children.map(c => ({ label: c.label, suffix: n.label, icon: c.icon, to: c.to })) : [{ label: n.label, icon: n.icon, to: n.to }]
  )
}, {
  id: 'actions',
  label: 'アクション',
  items: [
    { label: 'ユーザーを招待', icon: 'i-lucide-user-plus', to: '/users/invitations' },
    { label: '商品を追加', icon: 'i-lucide-plus', to: '/catalog/products' },
    { label: 'お知らせを作成', icon: 'i-lucide-megaphone', to: '/content/notices' }
  ]
}])

const navUi = {
  link: 'py-1.5',
  childList: 'ms-4 border-s border-default',
  childLink: 'ps-3',
  linkLeadingIcon: 'size-4.5'
}
</script>

<template>
  <div>
    <AppTitleBar />

    <UDashboardGroup unit="rem" class="top-12">
      <UDashboardSidebar
        id="main"
        collapsible
        resizable
        :default-size="16"
        :min-size="13"
        :max-size="22"
        class="env-sidebar bg-(--ui-bg)"
        :ui="{ footer: 'flex-col items-stretch gap-2 border-t border-default' }"
      >
        <template #default="{ collapsed }">
          <p v-if="!collapsed" class="px-2 pt-2 text-[10px] font-semibold tracking-[0.2em] text-dimmed">MENU</p>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="mainItems"
            orientation="vertical"
            tooltip
            popover
            :ui="navUi"
          />
          <UNavigationMenu
            :collapsed="collapsed"
            :items="footerItems"
            orientation="vertical"
            tooltip
            popover
            class="mt-auto"
            :ui="navUi"
          />
        </template>
        <template #footer="{ collapsed }">
          <EnvSwitcher :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>

      <UDashboardSearch :groups="searchGroups" placeholder="ページ・操作を検索..." />

      <slot />
    </UDashboardGroup>
  </div>
</template>
