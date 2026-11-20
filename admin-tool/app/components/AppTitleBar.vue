<script setup lang="ts">
const { info, current, isPreviewing } = useAppEnv()
const route = useRoute()
const crumbs = computed(() => findCrumbs(route.path))
const colorMode = useColorMode()

const userMenu = [[
  { label: '山田 太郎', description: 'admin@example.com', type: 'label' as const }
], [
  { label: 'プロフィール', icon: 'i-lucide-user', to: '/settings' },
  { label: 'セキュリティ', icon: 'i-lucide-lock', to: '/settings/security' }
], [
  { label: 'ログアウト', icon: 'i-lucide-log-out', color: 'error' as const }
]]

const notifications = [
  { icon: 'i-lucide-triangle-alert', color: 'text-warning', title: '在庫しきい値を下回りました', body: 'SKU-1042 ほか 4 件', at: '3分前' },
  { icon: 'i-lucide-circle-x', color: 'text-error', title: 'バッチ失敗: nightly-report', body: 'exit code 1', at: '1時間前' },
  { icon: 'i-lucide-user-plus', color: 'text-info', title: '新規ユーザー登録 28 件', body: '本日分', at: '今日' }
]
</script>

<template>
  <header class="env-titlebar fixed inset-x-0 top-0 z-50 h-12 flex items-center gap-3 px-3 overflow-hidden select-none">
    <!-- うっすら住んでいるマスコット -->
    <div class="pointer-events-none absolute inset-y-0 right-[480px] flex items-end gap-6" style="color: var(--env)">
      <EnvMascot :env="current" :animated="false" class="size-6 translate-y-0.5 opacity-15 -scale-x-100" :stroke-width="4" />
      <EnvMascot :env="current" class="size-14 translate-y-2.5 opacity-40" :stroke-width="2.5" />
    </div>
    <div class="pointer-events-none absolute -left-4 -bottom-6 opacity-[0.07]" style="color: var(--env)">
      <EnvMascot :env="current" :animated="false" class="size-24" :stroke-width="1.5" />
    </div>

    <!-- ロゴ -->
    <NuxtLink to="/" class="relative flex items-center gap-2 w-[232px] shrink-0 pl-1">
      <span class="grid place-items-center size-7 rounded-md border" style="border-color: var(--env); color: var(--env)">
        <EnvMascot :env="current" :animated="false" class="size-5" :stroke-width="5" />
      </span>
      <span class="font-semibold tracking-tight">Hatchery</span>
      <span class="text-xs text-muted font-mono">admin</span>
    </NuxtLink>

    <!-- 環境バッジ -->
    <UTooltip :text="info.tagline">
      <div
        class="relative flex items-center gap-2 h-7 pl-2 pr-2.5 rounded-full border text-xs font-mono"
        style="border-color: var(--env); color: var(--env); background: var(--env-faint)"
      >
        <span class="relative flex size-2">
          <span v-if="current === 'prod'" class="absolute inline-flex size-full animate-ping rounded-full opacity-60" style="background: var(--env)" />
          <span class="relative inline-flex size-2 rounded-full" style="background: var(--env)" />
        </span>
        <span class="font-semibold tracking-widest">{{ info.label }}</span>
        <span class="opacity-70">{{ info.creature }}</span>
        <span v-if="isPreviewing" class="opacity-60">(preview)</span>
      </div>
    </UTooltip>

    <!-- パンくず -->
    <nav class="relative hidden lg:flex items-center gap-1.5 text-sm text-muted min-w-0">
      <UIcon name="i-lucide-chevron-right" class="size-4 opacity-40" />
      <template v-for="(c, i) in crumbs" :key="i">
        <UIcon v-if="i > 0" name="i-lucide-chevron-right" class="size-4 opacity-40" />
        <NuxtLink v-if="c.to" :to="c.to" class="truncate hover:text-highlighted" :class="i === crumbs.length - 1 && 'text-highlighted'">{{ c.label }}</NuxtLink>
        <span v-else class="truncate" :class="i === crumbs.length - 1 && 'text-highlighted'">{{ c.label }}</span>
      </template>
    </nav>

    <div class="flex-1" />

    <div class="relative flex items-center gap-1">
      <UDashboardSearchButton class="w-64" :kbds="['meta', 'K']" />

      <UPopover :content="{ align: 'end' }">
        <UChip color="error" inset>
          <UButton icon="i-lucide-bell" color="neutral" variant="ghost" aria-label="通知" />
        </UChip>
        <template #content>
          <div class="w-80 p-1">
            <p class="px-2 py-1.5 text-xs text-muted">通知</p>
            <div v-for="n in notifications" :key="n.title" class="flex gap-3 p-2 rounded-md hover:bg-elevated">
              <UIcon :name="n.icon" class="size-5 shrink-0 mt-0.5" :class="n.color" />
              <div class="min-w-0 flex-1">
                <p class="text-sm text-highlighted">{{ n.title }}</p>
                <p class="text-xs text-muted">{{ n.body }}</p>
              </div>
              <span class="text-xs text-dimmed shrink-0">{{ n.at }}</span>
            </div>
          </div>
        </template>
      </UPopover>

      <UButton
        :icon="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'"
        color="neutral" variant="ghost" aria-label="テーマ切替"
        @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
      />

      <UDropdownMenu :items="userMenu" :content="{ align: 'end' }">
        <UButton color="neutral" variant="ghost" class="gap-2">
          <UAvatar text="山" size="xs" />
          <span class="text-sm">山田</span>
          <UIcon name="i-lucide-chevron-down" class="size-4 text-muted" />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>
