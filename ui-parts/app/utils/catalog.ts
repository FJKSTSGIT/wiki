import type { SideMenuGroup } from '~/components/parts/SideMenu.vue'

/** カタログ自身のメニュー（SideMenu 部品をそのまま使っている） */
export const CATALOG_MENU: SideMenuGroup[] = [
  {
    label: '部品',
    items: [
      { label: 'はじめに', icon: 'i-lucide-house', to: '/' },
      { label: 'パターン一覧', icon: 'i-lucide-list-checks', to: '/patterns', badge: 'NEW' },
      { label: 'サイドメニュー', icon: 'i-lucide-panel-left', to: '/parts/side-menu' },
      { label: '固定ヘッダー（環境表示）', icon: 'i-lucide-panel-top', to: '/parts/env-header' },
      { label: '権限による表示切替', icon: 'i-lucide-shield-check', to: '/parts/access' },
      { label: 'お知らせ設定', icon: 'i-lucide-megaphone', to: '/parts/notice' }
    ]
  },
  {
    label: '権限で出し分けるメニュー（例）',
    items: [
      { label: 'ダッシュボード', icon: 'i-lucide-layout-dashboard', to: '/samples/dashboard', permission: 'dashboard.view' },
      { label: 'ユーザー', icon: 'i-lucide-users', to: '/samples/users', permission: 'users.view' },
      { label: '売上', icon: 'i-lucide-japanese-yen', to: '/samples/sales', permission: 'sales.view' },
      { label: 'システム設定', icon: 'i-lucide-settings', to: '/samples/settings', permission: 'settings.manage' }
    ]
  }
]

/** サンプル画面と必要な権限 */
export const SAMPLE_SCREENS = {
  dashboard: { label: 'ダッシュボード', permission: 'dashboard.view' },
  users: { label: 'ユーザー', permission: 'users.view' },
  sales: { label: '売上', permission: 'sales.view' },
  settings: { label: 'システム設定', permission: 'settings.manage' }
} as const
