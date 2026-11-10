/** お知らせ（ゲーム内でプレイヤーに表示する告知）の定義 */
export type NoticeCategory = 'info' | 'maintenance' | 'event' | 'bug' | 'campaign'
export type NoticeDisplay = 'normal' | 'pinned' | 'popup'
export type NoticeTarget = 'all' | 'new' | 'payer' | 'dormant'
export type NoticePlatform = 'iOS' | 'Android' | 'PC'

export interface NoticeDraft {
  category: NoticeCategory
  title: string
  body: string
  startAt: string
  endAt: string
  platforms: NoticePlatform[]
  target: NoticeTarget
  display: NoticeDisplay
  push: boolean
  pushText: string
}

export const NOTICE_CATEGORIES: Record<NoticeCategory, { label: string, color: 'primary' | 'error' | 'success' | 'warning' | 'info', icon: string }> = {
  info: { label: 'お知らせ', color: 'primary', icon: 'i-lucide-megaphone' },
  maintenance: { label: 'メンテナンス', color: 'error', icon: 'i-lucide-wrench' },
  event: { label: 'イベント', color: 'success', icon: 'i-lucide-trophy' },
  bug: { label: '不具合', color: 'warning', icon: 'i-lucide-bug' },
  campaign: { label: 'キャンペーン', color: 'info', icon: 'i-lucide-gift' }
}

export const NOTICE_DISPLAYS: { value: NoticeDisplay, label: string, description: string }[] = [
  { value: 'normal', label: '通常', description: 'お知らせ一覧に表示' },
  { value: 'pinned', label: '上部に固定', description: '一覧の先頭に固定して表示' },
  { value: 'popup', label: 'ログイン時に表示', description: 'ログイン直後にポップアップで表示' }
]

export const NOTICE_TARGETS: { value: NoticeTarget, label: string }[] = [
  { value: 'all', label: 'すべてのプレイヤー' },
  { value: 'new', label: '新規（登録 7 日以内）' },
  { value: 'payer', label: '課金経験あり' },
  { value: 'dormant', label: '休眠（30 日以上未ログイン）' }
]

export const NOTICE_PLATFORMS: NoticePlatform[] = ['iOS', 'Android', 'PC']

/** datetime-local 用の文字列（yyyy-MM-ddTHH:mm） */
export function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function createNoticeDraft(): NoticeDraft {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return {
    category: 'info',
    title: '',
    body: '',
    startAt: toLocalInput(start),
    endAt: toLocalInput(end),
    platforms: [...NOTICE_PLATFORMS],
    target: 'all',
    display: 'normal',
    push: false,
    pushText: ''
  }
}

/** サンプル入力 */
export function sampleNoticeDraft(): NoticeDraft {
  return {
    ...createNoticeDraft(),
    category: 'maintenance',
    title: '定期メンテナンスのお知らせ（11/15）',
    body: 'いつも遊んでいただきありがとうございます。\n\n下記の日程で定期メンテナンスを実施します。\nメンテナンス中はゲームをプレイできません。\n\n■ 日時\n11月15日（日）2:00〜6:00（予定）\n\n■ 補填\nメンテナンス終了後、ジェム×300 をプレゼントボックスにお送りします。',
    display: 'popup',
    push: true,
    pushText: '11/15 2:00〜6:00 に定期メンテナンスを行います'
  }
}
