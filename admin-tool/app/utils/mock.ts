// 決定的なモックデータ（seed 付き乱数）
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}
const r = rng(42)
const pick = <T>(a: readonly T[]): T => a[Math.floor(r() * a.length)]!
const int = (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min
const daysAgo = (d: number, h = int(0, 23)) => new Date(Date.UTC(2026, 10, 20 - d, h, int(0, 59)))

const LAST = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '松本', '井上']
const FIRST = ['翔太', '美咲', '大輔', '結衣', '健太', '陽菜', '拓海', '葵', '蓮', 'さくら', '悠斗', '凛']

export type UserStatus = 'active' | 'invited' | 'suspended'
export interface User { id: number, name: string, email: string, role: string, status: UserStatus, lastLogin: Date, createdAt: Date, mfa: boolean, orders: number }

export const ROLES = [
  { id: 'owner', name: 'オーナー', desc: '全権限。請求情報を含む', users: 2, color: 'error' },
  { id: 'admin', name: '管理者', desc: 'ユーザー・設定の管理', users: 5, color: 'warning' },
  { id: 'operator', name: 'オペレーター', desc: '注文・在庫・コンテンツ運用', users: 14, color: 'primary' },
  { id: 'support', name: 'サポート', desc: 'ユーザー閲覧と注文対応', users: 9, color: 'info' },
  { id: 'viewer', name: '閲覧者', desc: '読み取り専用', users: 21, color: 'neutral' }
] as const

export const PERMISSIONS = [
  { group: 'ユーザー', items: ['users.read', 'users.write', 'users.delete', 'roles.manage'] },
  { group: '商品・在庫', items: ['products.read', 'products.write', 'inventory.adjust'] },
  { group: '注文', items: ['orders.read', 'orders.update', 'refunds.approve'] },
  { group: 'システム', items: ['audit.read', 'jobs.run', 'flags.toggle', 'apikeys.manage'] }
]

export const ROLE_MATRIX: Record<string, string[]> = {
  owner: PERMISSIONS.flatMap(p => p.items),
  admin: PERMISSIONS.flatMap(p => p.items).filter(p => p !== 'apikeys.manage'),
  operator: ['users.read', 'products.read', 'products.write', 'inventory.adjust', 'orders.read', 'orders.update', 'audit.read'],
  support: ['users.read', 'orders.read', 'orders.update', 'products.read'],
  viewer: ['users.read', 'products.read', 'orders.read', 'audit.read']
}

export const USERS: User[] = Array.from({ length: 64 }, (_, i) => {
  const l = pick(LAST), f = pick(FIRST)
  return {
    id: 1000 + i,
    name: `${l} ${f}`,
    email: `user${1000 + i}@example.com`,
    role: pick(['owner', 'admin', 'operator', 'operator', 'support', 'viewer', 'viewer']),
    status: pick(['active', 'active', 'active', 'active', 'invited', 'suspended'] as const),
    lastLogin: daysAgo(int(0, 40)),
    createdAt: daysAgo(int(40, 600)),
    mfa: r() > 0.3,
    orders: int(0, 80)
  }
})

const PRODUCT_NAMES = ['ステンレスボトル', 'リネンシャツ', 'レザーウォレット', 'ワイヤレスイヤホン', 'コーヒードリッパー', 'ウールソックス', 'キャンバストート', 'デスクライト', '陶器マグ', 'ノートA5', 'アロマキャンドル', 'ヨガマット', 'ブランケット', 'ガラスポット', '折りたたみ傘']
export const CATEGORIES = [
  { id: 1, name: 'ファッション', slug: 'fashion', parent: null, products: 128, visible: true },
  { id: 2, name: 'トップス', slug: 'tops', parent: 1, products: 54, visible: true },
  { id: 3, name: '小物', slug: 'accessories', parent: 1, products: 74, visible: true },
  { id: 4, name: 'ライフスタイル', slug: 'lifestyle', parent: null, products: 211, visible: true },
  { id: 5, name: 'キッチン', slug: 'kitchen', parent: 4, products: 88, visible: true },
  { id: 6, name: 'インテリア', slug: 'interior', parent: 4, products: 96, visible: true },
  { id: 7, name: 'アウトドア', slug: 'outdoor', parent: 4, products: 27, visible: false },
  { id: 8, name: 'ガジェット', slug: 'gadgets', parent: null, products: 63, visible: true },
  { id: 9, name: 'オーディオ', slug: 'audio', parent: 8, products: 22, visible: true }
]
export interface Product { id: number, sku: string, name: string, category: string, price: number, stock: number, threshold: number, status: 'published' | 'draft' | 'archived', updatedAt: Date, warehouse: string }
export const PRODUCTS: Product[] = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  sku: `SKU-${1001 + i}`,
  name: `${pick(PRODUCT_NAMES)} ${pick(['', 'Lite', 'Pro', 'S', 'M', 'L', '2'])}`.trim(),
  category: pick(CATEGORIES.filter(c => c.parent)).name,
  price: int(8, 240) * 100 - 20,
  stock: pick([0, int(1, 9), int(10, 300), int(10, 300), int(10, 300)]),
  threshold: pick([5, 10, 20]),
  status: pick(['published', 'published', 'published', 'draft', 'archived'] as const),
  updatedAt: daysAgo(int(0, 60)),
  warehouse: pick(['東京DC', '大阪DC', '福岡DC'])
}))

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export interface Order { id: string, customer: string, total: number, items: number, status: OrderStatus, payment: string, createdAt: Date }
export const ORDERS: Order[] = Array.from({ length: 80 }, (_, i) => ({
  id: `ORD-${(260000 + 80 - i).toString()}`,
  customer: `${pick(LAST)} ${pick(FIRST)}`,
  total: int(12, 480) * 100,
  items: int(1, 6),
  status: pick(['pending', 'paid', 'paid', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled', 'refunded'] as const),
  payment: pick(['クレジット', 'クレジット', 'コンビニ', '銀行振込', 'PayPay']),
  createdAt: daysAgo(Math.floor(i / 6))
}))

export const REFUNDS = ORDERS.filter(o => ['refunded', 'cancelled', 'delivered'].includes(o.status)).slice(0, 14).map((o, i) => ({
  id: `RF-${3100 + i}`,
  order: o.id,
  customer: o.customer,
  amount: Math.round(o.total * pick([1, 1, 0.5, 0.3])),
  reason: pick(['サイズ違い', '破損', '誤配送', 'イメージ違い', '重複注文']),
  status: pick(['requested', 'requested', 'approved', 'rejected', 'completed'] as const),
  requestedAt: daysAgo(int(0, 14))
}))

export const AUDIT_LOGS = Array.from({ length: 60 }, (_, i) => {
  const action = pick(['user.login', 'user.update', 'role.assign', 'product.update', 'inventory.adjust', 'order.refund', 'flag.toggle', 'apikey.create', 'settings.update', 'user.suspend'])
  return {
    id: 90000 - i,
    at: new Date(Date.UTC(2026, 10, 20, 12) - i * int(5, 90) * 60000),
    actor: pick(USERS.slice(0, 10)).name,
    action,
    target: action.startsWith('user') || action.startsWith('role') ? `user:${int(1000, 1063)}` : action.startsWith('product') || action.startsWith('inventory') ? `product:SKU-${int(1001, 1048)}` : action.startsWith('order') ? `order:ORD-${int(260000, 260080)}` : action.startsWith('flag') ? `flag:${pick(['new-checkout', 'dark-launch-search'])}` : 'system',
    ip: `10.${int(0, 9)}.${int(0, 255)}.${int(1, 254)}`,
    result: r() > 0.08 ? 'success' : 'failure'
  }
})

export const JOBS = [
  { id: 'nightly-report', name: '日次売上レポート', schedule: '0 3 * * *', lastRun: daysAgo(0, 3), duration: '4m 12s', status: 'failed', next: '明日 03:00' },
  { id: 'inventory-sync', name: '在庫同期 (WMS)', schedule: '*/15 * * * *', lastRun: daysAgo(0, 11), duration: '38s', status: 'success', next: '12:15' },
  { id: 'search-index', name: '検索インデックス再構築', schedule: '0 */6 * * *', lastRun: daysAgo(0, 6), duration: '12m 03s', status: 'running', next: '18:00' },
  { id: 'mail-digest', name: 'メールダイジェスト配信', schedule: '0 9 * * 1', lastRun: daysAgo(4, 9), duration: '2m 47s', status: 'success', next: '月曜 09:00' },
  { id: 'cleanup-sessions', name: '期限切れセッション削除', schedule: '30 4 * * *', lastRun: daysAgo(0, 4), duration: '9s', status: 'success', next: '明日 04:30' },
  { id: 'point-expire', name: 'ポイント失効処理', schedule: '0 0 1 * *', lastRun: daysAgo(19, 0), duration: '1m 55s', status: 'success', next: '12/01 00:00' }
] as const

export const FLAGS = [
  { key: 'new-checkout', name: '新チェックアウト', desc: '1ページ完結の購入フロー', envs: { local: true, dev: true, stg: true, prod: false }, rollout: 0 },
  { key: 'dark-launch-search', name: '新検索エンジン', desc: 'ベクトル検索をシャドー実行', envs: { local: true, dev: true, stg: true, prod: true }, rollout: 10 },
  { key: 'gift-wrapping', name: 'ギフトラッピング', desc: '注文時のラッピングオプション', envs: { local: true, dev: true, stg: false, prod: false }, rollout: 0 },
  { key: 'recommend-v2', name: 'レコメンド v2', desc: '閲覧履歴ベースの推薦', envs: { local: true, dev: true, stg: true, prod: true }, rollout: 50 },
  { key: 'maintenance-banner', name: 'メンテナンスバナー', desc: '全ページ上部に告知を表示', envs: { local: false, dev: false, stg: false, prod: false }, rollout: 100 }
]

export const API_KEYS = [
  { id: 'k1', name: 'WMS連携', prefix: 'hk_live_7Fa2', scopes: ['inventory:write', 'orders:read'], createdAt: daysAgo(210), lastUsed: daysAgo(0), expires: '2027-06-01' },
  { id: 'k2', name: '会計システム', prefix: 'hk_live_Q9mX', scopes: ['orders:read', 'refunds:read'], createdAt: daysAgo(400), lastUsed: daysAgo(1), expires: '2026-12-31' },
  { id: 'k3', name: 'BIツール', prefix: 'hk_live_b31Z', scopes: ['*:read'], createdAt: daysAgo(90), lastUsed: daysAgo(12), expires: 'なし' },
  { id: 'k4', name: '旧ECサイト (廃止予定)', prefix: 'hk_live_0LdP', scopes: ['products:read'], createdAt: daysAgo(900), lastUsed: daysAgo(160), expires: '2026-11-30' }
]

export const NOTICES = [
  { id: 1, title: '年末年始の配送スケジュールについて', status: 'scheduled', audience: '全員', publishAt: '2026-12-01 10:00', author: '佐藤 美咲' },
  { id: 2, title: '【重要】利用規約改定のお知らせ', status: 'published', audience: '全員', publishAt: '2026-11-15 09:00', author: '高橋 大輔' },
  { id: 3, title: 'ブラックフライデーセール開催', status: 'published', audience: '会員', publishAt: '2026-11-18 00:00', author: '田中 結衣' },
  { id: 4, title: 'システムメンテナンスのお知らせ (11/28)', status: 'draft', audience: '全員', publishAt: '-', author: '山田 太郎' },
  { id: 5, title: '新ブランド取り扱い開始', status: 'archived', audience: '会員', publishAt: '2026-10-01 10:00', author: '伊藤 陽菜' }
]

export const BANNERS = [
  { id: 1, title: 'BLACK FRIDAY', placement: 'トップ / ヒーロー', period: '11/18 – 11/30', clicks: 18420, ctr: 4.2, active: true, hue: 'from-zinc-700 to-zinc-900' },
  { id: 2, title: '送料無料キャンペーン', placement: 'トップ / サブ', period: '11/01 – 12/31', clicks: 6230, ctr: 2.1, active: true, hue: 'from-emerald-700 to-emerald-950' },
  { id: 3, title: 'ホリデーギフト特集', placement: 'カテゴリ / 上部', period: '12/01 – 12/25', clicks: 0, ctr: 0, active: false, hue: 'from-rose-800 to-rose-950' },
  { id: 4, title: '会員ランク特典', placement: 'マイページ', period: '常時', clicks: 2104, ctr: 1.3, active: true, hue: 'from-indigo-700 to-indigo-950' }
]

export const INVITATIONS = [
  { email: 'k.nakamura@example.com', role: 'operator', invitedBy: '山田 太郎', sentAt: daysAgo(1), expires: '残り6日' },
  { email: 'r.kobayashi@example.com', role: 'support', invitedBy: '佐藤 美咲', sentAt: daysAgo(3), expires: '残り4日' },
  { email: 'outsourcing@partner.example', role: 'viewer', invitedBy: '山田 太郎', sentAt: daysAgo(6), expires: '残り1日' }
]

/** 直近14日の注文数 */
export const DAILY_ORDERS = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.UTC(2026, 10, 7 + i)),
  count: int(120, 260) + (i > 10 ? 80 : 0)
}))

export const yen = (n: number) => '¥' + n.toLocaleString('ja-JP')
export const fmtDate = (d: Date) => d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })
export const fmtDay = (d: Date) => d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', timeZone: 'Asia/Tokyo' })

export const ORDER_STATUS: Record<OrderStatus, { label: string, color: 'neutral' | 'warning' | 'info' | 'primary' | 'success' | 'error' }> = {
  pending: { label: '未決済', color: 'warning' },
  paid: { label: '決済済', color: 'info' },
  shipped: { label: '発送済', color: 'primary' },
  delivered: { label: '配達完了', color: 'success' },
  cancelled: { label: 'キャンセル', color: 'neutral' },
  refunded: { label: '返金済', color: 'error' }
}
export const USER_STATUS: Record<UserStatus, { label: string, color: 'success' | 'warning' | 'error' }> = {
  active: { label: '有効', color: 'success' },
  invited: { label: '招待中', color: 'warning' },
  suspended: { label: '停止', color: 'error' }
}
export const roleName = (id: string) => ROLES.find(r => r.id === id)?.name ?? id
