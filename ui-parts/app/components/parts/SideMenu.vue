<script setup lang="ts">
/**
 * サイドメニュー
 *
 * - PC：左固定。アイコンだけの細い表示に折りたためる
 * - スマホ：v-model:open でスライドメニューとして開く
 * - 項目に permission を書くと、権限が無いユーザーには表示されない（子が全部消えたら親も消える）
 * - グループ（配列の配列）ごとに見出しを付けられる
 */
import type { NavigationMenuItem } from '@nuxt/ui'
import type { Permission } from '~/utils/access'

export interface SideMenuItem {
  label: string
  icon?: string
  to?: string
  badge?: string | number
  permission?: Permission
  children?: SideMenuItem[]
}

export interface SideMenuGroup {
  label?: string
  items: SideMenuItem[]
}

const props = withDefaults(defineProps<{
  groups: SideMenuGroup[]
  /** 折りたたみボタンを表示する */
  collapsible?: boolean
  /** 権限によるフィルタを行う（false にすると全項目を表示） */
  filterByPermission?: boolean
  /** 枠の中に埋め込んで表示するとき true（デモ用。通常は画面左に固定） */
  contained?: boolean
}>(), { collapsible: true, filterByPermission: true, contained: false })

const collapsed = defineModel<boolean>('collapsed', { default: false })
/** スマホでメニューを開いているか */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  header?(props: { collapsed: boolean }): any
  footer?(props: { collapsed: boolean }): any
}>()

const { can } = useAccess()

function filter(items: SideMenuItem[]): SideMenuItem[] {
  return items.flatMap((item) => {
    if (props.filterByPermission && !can(item.permission)) return []
    if (item.children) {
      const children = filter(item.children)
      return children.length ? [{ ...item, children }] : []
    }
    return [item]
  })
}

function toNav(items: SideMenuItem[]): NavigationMenuItem[] {
  return items.map(i => ({
    label: i.label,
    icon: i.icon,
    to: i.to,
    badge: i.badge !== undefined ? String(i.badge) : undefined,
    defaultOpen: true,
    children: i.children ? toNav(i.children) : undefined,
    onSelect: () => { open.value = false }
  }))
}

const visibleGroups = computed(() => props.groups
  .map(g => ({ label: g.label, items: toNav(filter(g.items)) }))
  .filter(g => g.items.length))
</script>

<template>
  <!-- PC -->
  <aside
    class="flex-col border-e border-default bg-elevated/25 transition-[width] duration-200"
    :class="[
      collapsed ? 'w-16' : contained ? 'w-full max-w-72' : 'w-60',
      contained ? 'flex h-full' : 'sticky top-0 hidden h-dvh shrink-0 lg:flex'
    ]"
  >
    <div v-if="$slots.header" class="flex h-14 shrink-0 items-center border-b border-default px-3">
      <slot name="header" :collapsed="collapsed" />
    </div>

    <nav class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-3" aria-label="メインメニュー">
      <div v-for="(g, i) in visibleGroups" :key="i" :class="i === visibleGroups.length - 1 && visibleGroups.length > 1 ? 'mt-auto' : ''">
        <p v-if="g.label && !collapsed" class="mb-1 px-2.5 text-xs font-medium text-dimmed">
          {{ g.label }}
        </p>
        <USeparator v-else-if="g.label && collapsed && i > 0" class="mb-2" />
        <UNavigationMenu :items="g.items" orientation="vertical" :collapsed="collapsed" tooltip popover />
      </div>
      <p v-if="!visibleGroups.length" class="px-2.5 text-xs text-muted">
        表示できるメニューがありません
      </p>
    </nav>

    <div class="shrink-0 border-t border-default p-2">
      <slot name="footer" :collapsed="collapsed" />
      <UButton
        v-if="collapsible"
        :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
        :label="collapsed ? undefined : 'メニューを折りたたむ'"
        color="neutral"
        variant="ghost"
        size="sm"
        block
        :square="collapsed"
        class="mt-1 justify-start text-muted"
        :aria-label="collapsed ? 'メニューを広げる' : 'メニューを折りたたむ'"
        @click="collapsed = !collapsed"
      />
    </div>
  </aside>

  <!-- スマホ -->
  <USlideover v-if="!contained" v-model:open="open" side="left" :ui="{ content: 'max-w-72' }" title="メニュー">
    <template #body>
      <div class="flex flex-col gap-4">
        <slot name="header" :collapsed="false" />
        <div v-for="(g, i) in visibleGroups" :key="i">
          <p v-if="g.label" class="mb-1 px-2.5 text-xs font-medium text-dimmed">
            {{ g.label }}
          </p>
          <UNavigationMenu :items="g.items" orientation="vertical" />
        </div>
        <slot name="footer" :collapsed="false" />
      </div>
    </template>
  </USlideover>
</template>
