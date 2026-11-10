<script setup lang="ts">
import type { SideMenuGroup } from '~/components/parts/SideMenu.vue'

useHead({ title: 'サイドメニュー' })

const collapsed = ref(false)
const showBadges = ref(true)
const filterByPermission = ref(true)
const { role } = useAccess()

const groups = computed<SideMenuGroup[]>(() => [
  {
    items: [
      { label: 'ダッシュボード', icon: 'i-lucide-layout-dashboard', to: '#dashboard', permission: 'dashboard.view' },
      { label: 'お知らせ', icon: 'i-lucide-megaphone', to: '#notice', permission: 'notice.view', badge: showBadges.value ? 3 : undefined },
      {
        label: 'プレイヤー',
        icon: 'i-lucide-gamepad-2',
        permission: 'users.view',
        children: [
          { label: '検索', to: '#players' },
          { label: '停止中', to: '#banned', badge: showBadges.value ? 12 : undefined }
        ]
      },
      { label: '売上', icon: 'i-lucide-japanese-yen', to: '#sales', permission: 'sales.view' }
    ]
  },
  {
    label: '設定',
    items: [
      { label: 'システム設定', icon: 'i-lucide-settings', to: '#settings', permission: 'settings.manage' },
      { label: 'ヘルプ', icon: 'i-lucide-life-buoy', to: '#help' }
    ]
  }
])

const code = `<script setup lang="ts">
import type { SideMenuGroup } from '~/components/parts/SideMenu.vue'

const collapsed = ref(false)   // 折りたたみ状態
const open = ref(false)        // スマホでメニューを開いているか

const groups: SideMenuGroup[] = [
  {
    items: [
      { label: 'ダッシュボード', icon: 'i-lucide-layout-dashboard', to: '/', permission: 'dashboard.view' },
      { label: 'お知らせ', icon: 'i-lucide-megaphone', to: '/notices', badge: 3, permission: 'notice.view' },
      {
        label: 'プレイヤー', icon: 'i-lucide-gamepad-2', permission: 'users.view',
        children: [{ label: '検索', to: '/players' }, { label: '停止中', to: '/players/banned' }]
      }
    ]
  },
  { label: '設定', items: [{ label: 'システム設定', icon: 'i-lucide-settings', to: '/settings', permission: 'settings.manage' }] }
]
<\/script>

<template>
  <div class="flex min-h-dvh">
    <SideMenu v-model:collapsed="collapsed" v-model:open="open" :groups="groups">
      <template #header="{ collapsed }">ロゴ</template>
      <template #footer>ユーザーメニュー</template>
    </SideMenu>
    <div class="flex-1">
      <EnvHeader env="production" @menu="open = true" />
      <main>...</main>
    </div>
  </div>
</template>`

const propsTable = [
  { name: 'groups', type: 'SideMenuGroup[]', description: 'メニューのグループ。最後のグループは下端に寄せて表示' },
  { name: 'v-model:collapsed', type: 'boolean', default: 'false', description: 'アイコンだけの細い表示にする' },
  { name: 'v-model:open', type: 'boolean', default: 'false', description: 'スマホでスライドメニューを開く' },
  { name: 'collapsible', type: 'boolean', default: 'true', description: '折りたたみボタンを出す' },
  { name: 'filterByPermission', type: 'boolean', default: 'true', description: '項目の permission を見て、権限が無いものを隠す' },
  { name: 'contained', type: 'boolean', default: 'false', description: '枠の中に埋め込んで表示する（プレビュー用）' },
  { name: 'item.permission', type: 'Permission', description: 'この項目を見るのに必要な権限' },
  { name: 'item.badge', type: 'string | number', description: '件数などのバッジ' },
  { name: 'item.children', type: 'SideMenuItem[]', description: '子メニュー（開閉式。折りたたみ時はポップアップ）' }
]
</script>

<template>
  <PartDoc
    title="サイドメニュー"
    file="components/parts/SideMenu.vue"
    summary="画面の左に置くメインメニューです。Nuxt UI の NavigationMenu をもとに、折りたたみ・スマホ表示・権限による出し分けをまとめました。"
    :points="['折りたたむとアイコンだけになり、ホバーで名前と子メニューを表示', 'スマホでは ☰ ボタンからスライドで開く', '項目ごとに必要な権限を書くだけで、権限の無い人には出ない', '件数バッジ・グループ見出し・下端に寄せるグループ']"
    :code="code"
    :props="propsTable"
  >
    <template #controls>
      <USwitch v-model="collapsed" label="折りたたむ" size="sm" />
      <USwitch v-model="showBadges" label="バッジ" size="sm" />
      <USwitch v-model="filterByPermission" label="権限で出し分け" size="sm" />
      <span class="flex items-center gap-2"><span class="text-xs text-muted">役割</span><RoleSwitcher size="sm" /></span>
    </template>

    <template #demo>
      <div class="flex h-[30rem] bg-default">
        <SideMenu v-model:collapsed="collapsed" :groups="groups" :filter-by-permission="filterByPermission" contained>
          <template #header="{ collapsed: c }">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-inverted">
              <UIcon name="i-lucide-swords" class="size-4" />
            </span>
            <span v-if="!c" class="ms-2 truncate text-sm font-semibold text-highlighted">Game Admin</span>
          </template>
          <template #footer="{ collapsed: c }">
            <UButton :avatar="{ alt: '管理 太郎' }" :label="c ? undefined : `管理 太郎（${role.label}）`" color="neutral" variant="ghost" block :square="c" class="justify-start" />
          </template>
        </SideMenu>
        <div class="hidden flex-1 items-center justify-center p-6 text-sm text-muted sm:flex">
          ここに画面の中身が入ります
        </div>
      </div>
    </template>
  </PartDoc>
</template>
