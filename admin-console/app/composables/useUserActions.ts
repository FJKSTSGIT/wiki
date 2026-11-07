import type { AdminUser } from '~/types'

/** ユーザーに対する操作（一覧・詳細で共通） */
export function useUserActions() {
  const db = useMockDb()
  const confirm = useConfirm()
  const toast = useToast()
  const { record } = useAuditLog()
  const { currentUser } = useSession()

  async function setStatus(users: AdminUser[], status: 'active' | 'suspended') {
    const targets = users.filter(u => u.id !== currentUser.value.id && u.status !== status)
    if (!targets.length) {
      toast.add({ title: '対象となるユーザーがいません', description: '自分自身や既に同じ状態のユーザーは対象外です', color: 'warning' })
      return false
    }
    const suspend = status === 'suspended'
    const ok = await confirm({
      title: suspend ? `${targets.length} 名のアカウントを停止しますか？` : `${targets.length} 名のアカウントを再開しますか？`,
      description: suspend ? '停止すると管理ツールにログインできなくなります。権限設定は保持されます。' : '再開すると、保持されている権限で再びログインできるようになります。',
      color: suspend ? 'error' : 'primary',
      confirmLabel: suspend ? '停止する' : '再開する',
      details: targets.slice(0, 10).map(u => ({ label: u.name, value: u.email })).concat(targets.length > 10 ? [{ label: `ほか ${targets.length - 10} 名`, value: '' }] : [])
    })
    if (!ok) return false

    for (const t of targets) {
      const u = db.value.users.find(x => x.id === t.id)
      if (u) u.status = status
      record({ category: 'user', action: suspend ? 'アカウントを停止' : 'アカウントを再開', target: t.name })
    }
    toast.add({ title: suspend ? 'アカウントを停止しました' : 'アカウントを再開しました', description: `${targets.length} 名`, color: 'success' })
    return true
  }

  return { setStatus }
}
