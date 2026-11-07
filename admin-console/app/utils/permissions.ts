/**
 * 権限カタログ（モック）
 *
 * 個別権限方式：`リソース.操作` 形式の権限キーをユーザーへ直接付与する。
 * 権限グループ方式へ移行する場合も、このカタログを「グループに含める権限」の定義として流用できる。
 *
 * ※ モック上の権限チェックはあくまで UI の出し分けであり、本番の認可処理（API 側）とは別物。
 */

export const PERMISSION_ACTIONS = {
  view: { label: '閲覧', icon: 'i-lucide-eye' },
  edit: { label: '編集', icon: 'i-lucide-pencil' },
  export: { label: 'CSV出力', icon: 'i-lucide-download' }
} as const

export type PermissionAction = keyof typeof PERMISSION_ACTIONS

export interface PermissionResource {
  key: string
  label: string
  icon: string
  description: string
  actions: readonly PermissionAction[]
  /** 操作ごとの補足（UI のツールチップに表示） */
  notes?: Partial<Record<PermissionAction, string>>
}

export const PERMISSION_RESOURCES = [
  {
    key: 'dashboard',
    label: 'ダッシュボード',
    icon: 'i-lucide-layout-dashboard',
    description: 'KPI・売上推移などサービス全体の状況',
    actions: ['view']
  },
  {
    key: 'users',
    label: 'ユーザー管理',
    icon: 'i-lucide-users',
    description: '管理ツール利用者（社内スタッフ）のアカウント',
    actions: ['view', 'edit', 'export'],
    notes: { edit: '招待・停止・プロフィール変更' }
  },
  {
    key: 'permissions',
    label: '権限管理',
    icon: 'i-lucide-shield-check',
    description: 'スタッフごとの権限設定',
    actions: ['view', 'edit'],
    notes: { edit: '他ユーザーの権限を変更できる強い権限です' }
  },
  {
    key: 'players',
    label: 'プレイヤー',
    icon: 'i-lucide-gamepad-2',
    description: 'ゲームプレイヤーの情報',
    actions: ['view', 'edit', 'export'],
    notes: { edit: 'アカウント停止・解除' }
  },
  {
    key: 'purchases',
    label: '課金履歴',
    icon: 'i-lucide-receipt-japanese-yen',
    description: 'アプリ内課金のトランザクション',
    actions: ['view', 'edit', 'export'],
    notes: { edit: '返金処理' }
  },
  {
    key: 'auditLogs',
    label: '操作ログ',
    icon: 'i-lucide-scroll-text',
    description: '管理ツール上の操作履歴',
    actions: ['view', 'export']
  }
] as const satisfies readonly PermissionResource[]

type Resources = typeof PERMISSION_RESOURCES[number]
export type PermissionResourceKey = Resources['key']
export type PermissionKey = {
  [R in Resources as R['key']]: `${R['key']}.${R['actions'][number]}`
}[Resources['key']]

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_RESOURCES.flatMap(r =>
  r.actions.map(a => `${r.key}.${a}` as PermissionKey)
)

/** 高リスク権限（付与時に警告を出す） */
export const HIGH_RISK_PERMISSIONS: PermissionKey[] = ['permissions.edit', 'purchases.edit', 'users.edit']

export function permissionLabel(key: PermissionKey): string {
  const [resourceKey, action] = key.split('.') as [string, PermissionAction]
  const resource = PERMISSION_RESOURCES.find(r => r.key === resourceKey)
  return `${resource?.label ?? resourceKey}：${PERMISSION_ACTIONS[action]?.label ?? action}`
}

/**
 * 権限の依存関係を正規化する
 * - 編集・CSV出力は閲覧が前提（閲覧が無ければ付与しない）
 */
export function normalizePermissions(keys: Iterable<string>): PermissionKey[] {
  const set = new Set(keys)
  return ALL_PERMISSIONS.filter((key) => {
    if (!set.has(key)) return false
    const [resource, action] = key.split('.')
    return action === 'view' || set.has(`${resource}.view`)
  })
}

/**
 * 権限テンプレート
 * 現時点では「個別権限を一括で入れるためのプリセット」として扱う。
 * 将来グループ方式を採用する場合は、これをグループ定義に昇格させる想定。
 */
export interface PermissionTemplate {
  id: string
  label: string
  description: string
  color: 'error' | 'warning' | 'primary' | 'info' | 'success' | 'neutral'
  permissions: PermissionKey[]
}

export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'admin',
    label: 'システム管理者',
    description: 'すべての機能を利用可能',
    color: 'error',
    permissions: [...ALL_PERMISSIONS]
  },
  {
    id: 'operator',
    label: '運用担当',
    description: 'プレイヤー対応と施策の確認',
    color: 'primary',
    permissions: ['dashboard.view', 'players.view', 'players.edit', 'players.export', 'purchases.view', 'auditLogs.view']
  },
  {
    id: 'support',
    label: 'カスタマーサポート',
    description: '問い合わせ対応・返金処理',
    color: 'info',
    permissions: ['dashboard.view', 'players.view', 'players.edit', 'purchases.view', 'purchases.edit']
  },
  {
    id: 'analyst',
    label: 'データ分析',
    description: '閲覧と CSV 出力のみ',
    color: 'success',
    permissions: ['dashboard.view', 'players.view', 'players.export', 'purchases.view', 'purchases.export', 'auditLogs.view', 'auditLogs.export']
  },
  {
    id: 'viewer',
    label: '閲覧のみ',
    description: 'ダッシュボードのみ閲覧可能',
    color: 'neutral',
    permissions: ['dashboard.view']
  }
]

export function findTemplate(id?: string) {
  return PERMISSION_TEMPLATES.find(t => t.id === id)
}

/** ユーザーの権限がテンプレートと一致しているか（一致しなければ「カスタム」扱い） */
export function matchesTemplate(permissions: PermissionKey[], templateId?: string) {
  const template = findTemplate(templateId)
  if (!template) return false
  const a = new Set(permissions)
  return template.permissions.length === a.size && template.permissions.every(p => a.has(p))
}
