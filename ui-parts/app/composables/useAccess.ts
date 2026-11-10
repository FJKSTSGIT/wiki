import { ROLES, type Permission } from '~/utils/access'

/**
 * ログインユーザーの権限（サンプル）
 *   const { can } = useAccess()
 *   can('notice.publish')
 *   can(['users.view', 'sales.view'], 'any')
 * 本番ではログイン時に API から受け取った権限一覧を permissions に入れる。
 * ※ ここは表示の出し分けのみ。実際の可否判定は必ずサーバー側でも行うこと。
 */
export function useAccess() {
  const roleId = useState('access-role', () => 'admin')
  const role = computed(() => ROLES.find(r => r.id === roleId.value) ?? ROLES[0]!)
  const permissions = computed(() => new Set<Permission>(role.value.permissions))

  function can(permission?: Permission | Permission[], match: 'all' | 'any' = 'all') {
    if (!permission) return true
    const list = Array.isArray(permission) ? permission : [permission]
    return match === 'all' ? list.every(p => permissions.value.has(p)) : list.some(p => permissions.value.has(p))
  }

  function setRole(id: string) {
    roleId.value = id
  }

  return { role, roleId: readonly(roleId), permissions, can, setRole }
}
