/**
 * モックデータ生成
 * シード付き乱数で毎回同じデータを生成する（リロードしても表示が変わらない）。
 * 本番では API レスポンスに置き換わる部分。
 */
import { subDays, subMinutes, addDays, startOfDay, formatISO } from 'date-fns'
import type { AdminUser, AuditLog, DailyMetric, GameEvent, Platform, Player, Purchase } from '~/types'
import { PERMISSION_TEMPLATES, type PermissionKey } from '~/utils/permissions'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createRandom(seed: number) {
  const next = mulberry32(seed)
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min
  const pick = <T>(list: readonly T[]): T => list[int(0, list.length - 1)]!
  const weighted = <T>(entries: readonly [T, number][]): T => {
    const total = entries.reduce((s, [, w]) => s + w, 0)
    let r = next() * total
    for (const [v, w] of entries) {
      if ((r -= w) < 0) return v
    }
    return entries[entries.length - 1]![0]
  }
  return { next, int, pick, weighted }
}

const iso = (d: Date) => formatISO(d)

const LAST_NAMES = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本', '阿部', '石川']
const FIRST_NAMES = ['翔太', '美咲', '大輔', '彩', '健太', '陽菜', '拓也', '結衣', '直樹', '真由', '亮', '沙織', '悠斗', '葵', '雄一', '千尋', '海斗', '里奈', '智也', '麻衣']
const ROMAJI = ['sato', 'suzuki', 'takahashi', 'tanaka', 'ito', 'watanabe', 'yamamoto', 'nakamura', 'kobayashi', 'kato', 'yoshida', 'yamada', 'sasaki', 'matsumoto', 'inoue', 'kimura', 'hayashi', 'shimizu', 'yamazaki', 'mori', 'ikeda', 'hashimoto', 'abe', 'ishikawa']

const DEPARTMENTS: [string, string, string][] = [
  ['開発部', 'エンジニア', 'admin'],
  ['開発部', 'テックリード', 'admin'],
  ['運営部', 'ゲームプランナー', 'operator'],
  ['運営部', '運営ディレクター', 'operator'],
  ['CS部', 'サポート担当', 'support'],
  ['CS部', 'サポートリーダー', 'support'],
  ['データ分析部', 'アナリスト', 'analyst'],
  ['マーケティング部', 'マーケター', 'analyst'],
  ['経営企画部', 'マネージャー', 'viewer']
]

export function generateAdminUsers(now: Date): AdminUser[] {
  const r = createRandom(11)
  const users: AdminUser[] = [
    {
      id: 'U-0001',
      name: '管理 太郎',
      email: 'taro.kanri@example.com',
      department: '開発部',
      title: 'システム管理者',
      status: 'active',
      permissions: [...PERMISSION_TEMPLATES[0]!.permissions],
      templateId: 'admin',
      twoFactor: true,
      lastLoginAt: iso(subMinutes(now, 3)),
      createdAt: iso(subDays(now, 720))
    }
  ]

  for (let i = 2; i <= 42; i++) {
    const li = r.int(0, LAST_NAMES.length - 1)
    const first = r.pick(FIRST_NAMES)
    const [department, title, templateId] = r.pick(DEPARTMENTS)
    const template = PERMISSION_TEMPLATES.find(t => t.id === templateId)!
    let permissions: PermissionKey[] = [...template.permissions]

    // 一部ユーザーはテンプレートから個別に調整されている
    if (r.next() < 0.25 && templateId !== 'admin') {
      const extras: PermissionKey[] = ['users.view', 'auditLogs.view', 'players.export', 'purchases.export']
      const extra = r.pick(extras)
      if (!permissions.includes(extra)) permissions = [...permissions, extra]
    }

    const status = r.weighted<AdminUser['status']>([['active', 32], ['invited', 4], ['suspended', 3]])
    const createdAt = subDays(now, r.int(10, 900))

    users.push({
      id: `U-${String(i).padStart(4, '0')}`,
      name: `${LAST_NAMES[li]} ${first}`,
      email: `${ROMAJI[li]}.${i}@example.com`,
      department,
      title,
      status,
      permissions,
      templateId,
      twoFactor: r.next() < 0.8,
      lastLoginAt: status === 'invited' ? null : iso(subMinutes(now, r.int(5, 60 * 24 * 40))),
      createdAt: iso(createdAt)
    })
  }

  return users
}

const PLAYER_PREFIX = ['ゆう', 'Shadow', 'もち', 'Ryu', 'さくら', 'Nova', 'たまご', 'Blaze', 'ねこ', 'Kai', 'ひかり', 'Zero', 'みどり', 'Luna', 'こはる', 'Ace']
const PLAYER_SUFFIX = ['', '', '_jp', '★', '01', '99', 'たん', 'Pro', '_', 'X', '7']
const COUNTRIES: [string, number][] = [['日本', 70], ['台湾', 8], ['韓国', 6], ['アメリカ', 8], ['タイ', 4], ['その他', 4]]
const PLATFORMS: [Platform, number][] = [['iOS', 45], ['Android', 42], ['PC', 13]]

export const PRODUCTS = [
  { id: 'gem_120', name: 'ジェム ×120', category: 'ジェム', price: 160 },
  { id: 'gem_600', name: 'ジェム ×600', category: 'ジェム', price: 800 },
  { id: 'gem_1300', name: 'ジェム ×1,300', category: 'ジェム', price: 1600 },
  { id: 'gem_3600', name: 'ジェム ×3,600', category: 'ジェム', price: 4400 },
  { id: 'gem_8000', name: 'ジェム ×8,000', category: 'ジェム', price: 9800 },
  { id: 'pass_monthly', name: '月間パス', category: 'パス', price: 610 },
  { id: 'pass_battle', name: 'バトルパス シーズン12', category: 'パス', price: 1220 },
  { id: 'pack_starter', name: 'スターターパック', category: 'パック', price: 370 },
  { id: 'pack_anniv', name: '2周年記念パック', category: 'パック', price: 3000 },
  { id: 'skin_ninja', name: '限定スキン「影忍」', category: 'スキン', price: 2400 }
] as const

export function generatePlayers(now: Date): Player[] {
  const r = createRandom(23)
  return Array.from({ length: 480 }, (_, i) => {
    const registeredAt = subDays(now, r.int(0, 730))
    const status = r.weighted<Player['status']>([['active', 78], ['dormant', 18], ['banned', 4]])
    const lastLoginAt = status === 'dormant'
      ? subDays(now, r.int(31, 200))
      : subMinutes(now, r.int(1, 60 * 24 * 14))
    const whale = r.next() < 0.06
    const payer = whale || r.next() < 0.35
    const purchaseCount = payer ? r.int(1, whale ? 80 : 12) : 0
    return {
      id: `P-${String(100001 + i * 7)}`,
      name: `${r.pick(PLAYER_PREFIX)}${r.pick(PLAYER_SUFFIX)}${r.int(1, 999)}`,
      platform: r.weighted(PLATFORMS),
      status,
      level: r.int(1, 180),
      country: r.weighted(COUNTRIES),
      totalSpend: 0,
      purchaseCount,
      registeredAt: iso(registeredAt),
      lastLoginAt: iso(lastLoginAt < registeredAt ? registeredAt : lastLoginAt)
    }
  })
}

export function generatePurchases(now: Date, players: Player[]): Purchase[] {
  const r = createRandom(37)
  const purchases: Purchase[] = []
  let seq = 1
  for (const player of players) {
    for (let i = 0; i < player.purchaseCount; i++) {
      const product = r.weighted(PRODUCTS.map(p => [p, p.price < 1000 ? 5 : p.price < 5000 ? 3 : 1] as [typeof p, number]))
      const purchasedAt = subMinutes(now, r.int(10, 60 * 24 * 120))
      const status = r.weighted<Purchase['status']>([['completed', 95], ['pending', 2], ['refunded', 3]])
      purchases.push({
        id: `T-${String(seq++).padStart(7, '0')}`,
        playerId: player.id,
        playerName: player.name,
        productId: product.id,
        productName: product.name,
        category: product.category,
        amount: product.price,
        platform: player.platform,
        status,
        purchasedAt: iso(purchasedAt)
      })
      if (status === 'completed') player.totalSpend += product.price
    }
  }
  return purchases.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
}

export function generateDailyMetrics(now: Date, days = 120): DailyMetric[] {
  const r = createRandom(41)
  const today = startOfDay(now)
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i)
    const dow = date.getDay()
    const weekend = dow === 0 || dow === 6 ? 1.18 : 1
    const growth = 1 + i * 0.0025
    // 30日前に大型イベントがあった想定のスパイク
    const event = i > days - 34 && i < days - 24 ? 1.35 : 1
    const dau = Math.round(84000 * growth * weekend * event * (0.95 + r.next() * 0.1))
    const payingUsers = Math.round(dau * (0.031 + r.next() * 0.008) * event)
    const revenue = Math.round(payingUsers * (1650 + r.next() * 500))
    const ios = Math.round(revenue * (0.48 + r.next() * 0.04))
    const android = Math.round(revenue * (0.4 + r.next() * 0.03))
    return {
      date: iso(date),
      dau,
      newUsers: Math.round(dau * (0.035 + r.next() * 0.015) * (event > 1 ? 1.6 : 1)),
      revenue,
      payingUsers,
      iosRevenue: ios,
      androidRevenue: android,
      pcRevenue: Math.max(0, revenue - ios - android)
    }
  })
}

export function generateGameEvents(now: Date): GameEvent[] {
  const today = startOfDay(now)
  const list: Omit<GameEvent, 'id' | 'status'>[] = [
    { title: '2周年記念 大感謝祭', type: 'event', startAt: iso(subDays(today, 30)), endAt: iso(subDays(today, 20)) },
    { title: '新キャラ「紅蓮の剣士」ピックアップガチャ', type: 'gacha', startAt: iso(subDays(today, 3)), endAt: iso(addDays(today, 11)) },
    { title: 'ギルド対抗戦 シーズン8', type: 'event', startAt: iso(subDays(today, 1)), endAt: iso(addDays(today, 6)) },
    { title: '週末ログインボーナス', type: 'campaign', startAt: iso(addDays(today, 2)), endAt: iso(addDays(today, 4)) },
    { title: '定期メンテナンス（v3.12.0 アップデート）', type: 'maintenance', startAt: iso(addDays(today, 5)), endAt: iso(addDays(today, 5)) },
    { title: 'v3.12.0 リリース：新エリア「天空遺跡」', type: 'release', startAt: iso(addDays(today, 5)), endAt: iso(addDays(today, 5)) },
    { title: 'ハロウィン限定ガチャ', type: 'gacha', startAt: iso(subDays(today, 14)), endAt: iso(subDays(today, 6)) }
  ]
  return list.map((e, i) => {
    const start = new Date(e.startAt)
    const end = addDays(new Date(e.endAt), 1)
    const status: GameEvent['status'] = now < start ? 'scheduled' : now >= end ? 'ended' : 'running'
    return { ...e, id: `E-${100 + i}`, status }
  }).sort((a, b) => b.startAt.localeCompare(a.startAt))
}

export function generateAuditLogs(now: Date, users: AdminUser[], players: Player[]): AuditLog[] {
  const r = createRandom(53)
  const actors = users.filter(u => u.status === 'active')
  const templates: [() => Omit<AuditLog, 'id' | 'actorId' | 'actorName' | 'createdAt'>, number][] = [
    [() => ({ category: 'auth', action: 'ログイン', target: '管理ツール' }), 30],
    [() => ({ category: 'player', action: 'プレイヤー情報を閲覧', target: r.pick(players).id }), 20],
    [() => ({ category: 'player', action: 'アカウントを停止', target: r.pick(players).id, detail: '不正ツール使用の疑い' }), 3],
    [() => ({ category: 'purchase', action: '返金処理', target: `T-${String(r.int(1, 9000)).padStart(7, '0')}`, detail: '二重課金のため' }), 3],
    [() => ({ category: 'export', action: 'CSV を出力', target: r.pick(['課金履歴', 'プレイヤー一覧', '操作ログ']), detail: `${r.int(20, 1500)} 件` }), 8],
    [() => ({ category: 'permission', action: '権限を変更', target: r.pick(users).name, detail: '+ players.export' }), 3],
    [() => ({ category: 'user', action: 'ユーザーを招待', target: r.pick(users).email }), 2],
    [() => ({ category: 'content', action: 'お知らせを公開', target: r.pick(['メンテナンスのお知らせ', 'ガチャ開催のお知らせ', '不具合修正のお知らせ']) }), 5]
  ]
  return Array.from({ length: 260 }, (_, i) => {
    const actor = r.pick(actors)
    const entry = r.weighted(templates)()
    return {
      id: `L-${String(900000 - i)}`,
      actorId: actor.id,
      actorName: actor.name,
      createdAt: iso(subMinutes(now, i * r.int(10, 50) + r.int(0, 9))),
      ...entry
    }
  })
}
