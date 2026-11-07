/**
 * モック用のインメモリ DB
 *
 * 画面からは「リポジトリ」的な関数経由でデータにアクセスする。
 * 本番実装ではこのファイルを API クライアント（useFetch / $fetch）に置き換える想定。
 * 変更はブラウザのメモリ上だけで保持され、リロードで初期状態に戻る。
 */
import type { AdminUser, AuditLog, DailyMetric, GameEvent, Player, Purchase } from '~/types'
import {
  generateAdminUsers,
  generateAuditLogs,
  generateDailyMetrics,
  generateGameEvents,
  generatePlayers,
  generatePurchases
} from '~/utils/mock/generate'

interface MockDb {
  users: AdminUser[]
  players: Player[]
  purchases: Purchase[]
  auditLogs: AuditLog[]
  events: GameEvent[]
  metrics: DailyMetric[]
}

function createDb(): MockDb {
  const now = new Date()
  const users = generateAdminUsers(now)
  const players = generatePlayers(now)
  const purchases = generatePurchases(now, players)
  return {
    users,
    players,
    purchases,
    auditLogs: generateAuditLogs(now, users, players),
    events: generateGameEvents(now),
    metrics: generateDailyMetrics(now)
  }
}

export function useMockDb() {
  return useState<MockDb>('mock-db', createDb)
}
