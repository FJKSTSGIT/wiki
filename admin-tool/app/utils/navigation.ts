import type { NavigationMenuItem } from '@nuxt/ui'

export interface NavNode {
  label: string
  icon: string
  to?: string
  badge?: string
  children?: { label: string, to: string, icon?: string, badge?: string }[]
}

export const NAV_MAIN: NavNode[] = [
  { label: 'ダッシュボード', icon: 'i-lucide-layout-dashboard', to: '/' },
  {
    label: 'ユーザー管理', icon: 'i-lucide-users',
    children: [
      { label: 'ユーザー一覧', to: '/users', icon: 'i-lucide-user' },
      { label: 'ロール・権限', to: '/users/roles', icon: 'i-lucide-shield-check' },
      { label: '招待', to: '/users/invitations', icon: 'i-lucide-mail-plus', badge: '3' }
    ]
  },
  {
    label: '商品・在庫', icon: 'i-lucide-package',
    children: [
      { label: '商品一覧', to: '/catalog/products', icon: 'i-lucide-box' },
      { label: 'カテゴリ', to: '/catalog/categories', icon: 'i-lucide-folder-tree' },
      { label: '在庫', to: '/catalog/inventory', icon: 'i-lucide-warehouse' }
    ]
  },
  {
    label: '注文', icon: 'i-lucide-shopping-cart',
    children: [
      { label: '注文一覧', to: '/orders', icon: 'i-lucide-receipt', badge: '12' },
      { label: '返品・返金', to: '/orders/refunds', icon: 'i-lucide-undo-2' }
    ]
  },
  {
    label: 'コンテンツ', icon: 'i-lucide-newspaper',
    children: [
      { label: 'お知らせ', to: '/content/notices', icon: 'i-lucide-megaphone' },
      { label: 'バナー', to: '/content/banners', icon: 'i-lucide-image' }
    ]
  },
  {
    label: 'システム', icon: 'i-lucide-cpu',
    children: [
      { label: '監査ログ', to: '/system/audit-logs', icon: 'i-lucide-scroll-text' },
      { label: 'バッチジョブ', to: '/system/jobs', icon: 'i-lucide-timer' },
      { label: '機能フラグ', to: '/system/feature-flags', icon: 'i-lucide-flag' },
      { label: 'APIキー', to: '/system/api-keys', icon: 'i-lucide-key-round' }
    ]
  }
]

export const NAV_FOOTER: NavNode[] = [
  {
    label: '設定', icon: 'i-lucide-settings',
    children: [
      { label: '一般', to: '/settings', icon: 'i-lucide-sliders-horizontal' },
      { label: '通知', to: '/settings/notifications', icon: 'i-lucide-bell' },
      { label: 'セキュリティ', to: '/settings/security', icon: 'i-lucide-lock' }
    ]
  }
]

export function toMenuItems(nodes: NavNode[], currentPath: string): NavigationMenuItem[] {
  return nodes.map(n => ({
    label: n.label,
    icon: n.icon,
    to: n.to,
    badge: n.badge,
    defaultOpen: n.children?.some(c => isActive(c.to, currentPath)),
    children: n.children?.map(c => ({ label: c.label, to: c.to, icon: c.icon, badge: c.badge, exact: true }))
  }))
}

function isActive(to: string, path: string) {
  return path === to || path.startsWith(to + '/')
}

/** 現在パスから [親, 子] のパンくずを返す */
export function findCrumbs(path: string): { label: string, to?: string, icon?: string }[] {
  for (const n of [...NAV_MAIN, ...NAV_FOOTER]) {
    if (n.to && n.to === path) return [{ label: n.label, icon: n.icon }]
    const hit = n.children?.filter(c => isActive(c.to, path)).sort((a, b) => b.to.length - a.to.length)[0]
    if (hit) return [{ label: n.label, icon: n.icon }, { label: hit.label, to: hit.to }]
  }
  return []
}
