/**
 * 権限と役割（サンプル定義）
 * 実際の画面に合わせて Permission を増やしていく。
 */
export const PERMISSIONS = {
  'dashboard.view': 'ダッシュボードを見る',
  'users.view': 'ユーザーを見る',
  'users.edit': 'ユーザーを編集する',
  'notice.view': 'お知らせを見る',
  'notice.edit': 'お知らせを作成・編集する',
  'notice.publish': 'お知らせを公開する',
  'sales.view': '売上を見る',
  'settings.manage': 'システム設定を変更する'
} as const

export type Permission = keyof typeof PERMISSIONS

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[]

export interface Role {
  id: string
  label: string
  description: string
  color: 'error' | 'primary' | 'info' | 'success' | 'neutral'
  permissions: Permission[]
}

export const ROLES: Role[] = [
  { id: 'admin', label: '管理者', description: 'すべて操作できる', color: 'error', permissions: [...ALL_PERMISSIONS] },
  { id: 'planner', label: '運営プランナー', description: 'お知らせの作成・公開ができる', color: 'primary', permissions: ['dashboard.view', 'notice.view', 'notice.edit', 'notice.publish', 'sales.view'] },
  { id: 'support', label: 'サポート', description: 'お知らせの下書きとユーザー対応', color: 'info', permissions: ['dashboard.view', 'users.view', 'users.edit', 'notice.view', 'notice.edit'] },
  { id: 'viewer', label: '閲覧のみ', description: 'ダッシュボードとお知らせを見るだけ', color: 'neutral', permissions: ['dashboard.view', 'notice.view'] }
]
