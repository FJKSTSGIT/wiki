import type { PermissionKey } from '~/utils/permissions'

/**
 * 権限チェック（UI の出し分け用）
 *
 * 例:
 *   const { can } = usePermission()
 *   can('users.edit')
 *   can(['players.view', 'purchases.view'], 'any')
 *
 * ※ 本番の認可は必ず API 側でも行うこと。ここは表示制御のみ。
 */
export function usePermission() {
  const { currentUser } = useSession()

  const granted = computed(() => new Set<string>(currentUser.value.permissions))

  function can(permission?: PermissionKey | PermissionKey[], mode: 'all' | 'any' = 'all') {
    if (!permission) return true
    const list = Array.isArray(permission) ? permission : [permission]
    if (!list.length) return true
    return mode === 'all' ? list.every(p => granted.value.has(p)) : list.some(p => granted.value.has(p))
  }

  return { can, granted }
}
