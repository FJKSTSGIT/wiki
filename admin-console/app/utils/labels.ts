import type { AuditCategory, GameEventStatus, GameEventType, PlayerStatus, PurchaseStatus, UserStatus } from '~/types'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
interface StatusMeta { label: string, color: BadgeColor, icon?: string }

/** ステータス表示の定義を一元管理（バッジ・フィルター・CSV で共通利用） */
export const USER_STATUS: Record<UserStatus, StatusMeta> = {
  active: { label: '有効', color: 'success', icon: 'i-lucide-circle-check' },
  invited: { label: '招待中', color: 'info', icon: 'i-lucide-mail' },
  suspended: { label: '停止中', color: 'error', icon: 'i-lucide-ban' }
}

export const PLAYER_STATUS: Record<PlayerStatus, StatusMeta> = {
  active: { label: 'アクティブ', color: 'success' },
  dormant: { label: '休眠', color: 'neutral' },
  banned: { label: '停止中', color: 'error' }
}

export const PURCHASE_STATUS: Record<PurchaseStatus, StatusMeta> = {
  completed: { label: '完了', color: 'success' },
  pending: { label: '処理中', color: 'warning' },
  refunded: { label: '返金済', color: 'neutral' }
}

export const EVENT_STATUS: Record<GameEventStatus, StatusMeta> = {
  running: { label: '開催中', color: 'success' },
  scheduled: { label: '予定', color: 'info' },
  ended: { label: '終了', color: 'neutral' }
}

export const EVENT_TYPE: Record<GameEventType, StatusMeta> = {
  event: { label: 'イベント', color: 'primary', icon: 'i-lucide-trophy' },
  gacha: { label: 'ガチャ', color: 'warning', icon: 'i-lucide-sparkles' },
  maintenance: { label: 'メンテナンス', color: 'error', icon: 'i-lucide-wrench' },
  release: { label: 'リリース', color: 'info', icon: 'i-lucide-rocket' },
  campaign: { label: 'キャンペーン', color: 'success', icon: 'i-lucide-gift' }
}

export const AUDIT_CATEGORY: Record<AuditCategory, StatusMeta> = {
  auth: { label: '認証', color: 'neutral', icon: 'i-lucide-log-in' },
  user: { label: 'ユーザー', color: 'info', icon: 'i-lucide-user-cog' },
  permission: { label: '権限', color: 'error', icon: 'i-lucide-shield' },
  player: { label: 'プレイヤー', color: 'primary', icon: 'i-lucide-gamepad-2' },
  purchase: { label: '課金', color: 'warning', icon: 'i-lucide-receipt' },
  export: { label: 'CSV出力', color: 'success', icon: 'i-lucide-download' },
  content: { label: 'コンテンツ', color: 'secondary', icon: 'i-lucide-megaphone' }
}

/** Record から USelect 用の選択肢を作る */
export function toOptions<K extends string>(record: Record<K, StatusMeta>) {
  return (Object.keys(record) as K[]).map(value => ({ label: record[value].label, value }))
}
