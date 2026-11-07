import type { AuditLog } from '~/types'

/** 操作ログの記録（モック）。権限変更・CSV 出力などの重要操作で呼び出す */
export function useAuditLog() {
  const db = useMockDb()
  const { currentUser } = useSession()

  function record(entry: Pick<AuditLog, 'category' | 'action' | 'target'> & { detail?: string }) {
    db.value.auditLogs.unshift({
      id: `L-${Date.now()}`,
      actorId: currentUser.value.id,
      actorName: currentUser.value.name,
      createdAt: new Date().toISOString(),
      ...entry
    })
  }

  return { record }
}
