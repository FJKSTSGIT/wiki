import type { PermissionKey } from '~/utils/permissions'

/**
 * サイドバー・コマンドパレット共通のナビゲーション定義
 * `permission` を持たない項目は常に表示。子要素がすべて非表示なら親も非表示になる。
 * 画面を追加するときはここに 1 行足し、ページ側で definePageMeta({ permission }) を指定する。
 */
export interface AppNavItem {
  label: string
  icon?: string
  to?: string
  permission?: PermissionKey
  badge?: string
  children?: AppNavItem[]
}

export const MAIN_NAVIGATION: AppNavItem[] = [
  { label: 'ダッシュボード', icon: 'i-lucide-layout-dashboard', to: '/', permission: 'dashboard.view' },
  { label: 'ユーザー管理', icon: 'i-lucide-users', to: '/users', permission: 'users.view' },
  { label: '権限管理', icon: 'i-lucide-shield-check', to: '/permissions', permission: 'permissions.view' },
  {
    label: 'データ管理',
    icon: 'i-lucide-database',
    children: [
      { label: 'プレイヤー', icon: 'i-lucide-gamepad-2', to: '/data/players', permission: 'players.view' },
      { label: '課金履歴', icon: 'i-lucide-receipt-japanese-yen', to: '/data/purchases', permission: 'purchases.view' }
    ]
  },
  { label: '操作ログ', icon: 'i-lucide-scroll-text', to: '/audit-logs', permission: 'auditLogs.view' }
]

export const SECONDARY_NAVIGATION: AppNavItem[] = [
  { label: 'ヘルプ', icon: 'i-lucide-life-buoy', to: '/help' }
]

export function filterNavigation(items: AppNavItem[], can: (p?: PermissionKey) => boolean): AppNavItem[] {
  return items.flatMap((item) => {
    if (!can(item.permission)) return []
    if (item.children) {
      const children = filterNavigation(item.children, can)
      return children.length ? [{ ...item, children }] : []
    }
    return [item]
  })
}

/** 権限上アクセスできる最初の画面（ログイン直後・権限不足時の遷移先） */
export function firstAccessiblePath(can: (p?: PermissionKey) => boolean): string | undefined {
  const flat = filterNavigation(MAIN_NAVIGATION, can).flatMap(i => i.children ?? [i])
  return flat.find(i => i.to)?.to
}
