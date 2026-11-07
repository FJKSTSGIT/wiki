import type { PermissionKey } from '~/utils/permissions'

/** 管理ツールの利用者（社内スタッフ）のステータス */
export type UserStatus = 'active' | 'invited' | 'suspended'

/** 管理ツールの利用者（社内スタッフ） */
export interface AdminUser {
  id: string
  name: string
  email: string
  department: string
  title: string
  status: UserStatus
  /** 個別権限方式：ユーザーが直接保持する権限キーの一覧 */
  permissions: PermissionKey[]
  /** 最後に適用した権限テンプレート（参考情報。適用後に個別変更されることがある） */
  templateId?: string
  twoFactor: boolean
  lastLoginAt: string | null
  createdAt: string
}

export type Platform = 'iOS' | 'Android' | 'PC'

export type PlayerStatus = 'active' | 'dormant' | 'banned'

/** ゲームのプレイヤー */
export interface Player {
  id: string
  name: string
  platform: Platform
  status: PlayerStatus
  level: number
  country: string
  totalSpend: number
  purchaseCount: number
  registeredAt: string
  lastLoginAt: string
}

export type PurchaseStatus = 'completed' | 'pending' | 'refunded'

/** 課金履歴 */
export interface Purchase {
  id: string
  playerId: string
  playerName: string
  productId: string
  productName: string
  category: string
  amount: number
  platform: Platform
  status: PurchaseStatus
  purchasedAt: string
}

export type AuditCategory = 'auth' | 'user' | 'permission' | 'player' | 'purchase' | 'export' | 'content'

/** 管理ツール上の操作ログ */
export interface AuditLog {
  id: string
  actorId: string
  actorName: string
  category: AuditCategory
  action: string
  target: string
  detail?: string
  createdAt: string
}

export type GameEventType = 'event' | 'gacha' | 'maintenance' | 'release' | 'campaign'
export type GameEventStatus = 'scheduled' | 'running' | 'ended'

/** ゲーム内イベント・運営施策 */
export interface GameEvent {
  id: string
  title: string
  type: GameEventType
  status: GameEventStatus
  startAt: string
  endAt: string
}

/** 日次 KPI */
export interface DailyMetric {
  date: string
  dau: number
  newUsers: number
  revenue: number
  payingUsers: number
  iosRevenue: number
  androidRevenue: number
  pcRevenue: number
}
