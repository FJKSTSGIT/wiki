/**
 * 画面単位の権限チェック（モック）
 * ページの definePageMeta({ permission }) を見て、権限が無ければアクセス拒否画面へ。
 */
export default defineNuxtRouteMiddleware((to) => {
  const { can } = usePermission()
  const permission = to.meta.permission

  if (to.path === '/' && !can('dashboard.view')) {
    const fallback = firstAccessiblePath(can)
    if (fallback && fallback !== '/') return navigateTo(fallback)
  }

  if (permission && !can(permission)) {
    return navigateTo({ path: '/forbidden', query: { from: to.fullPath, required: permission } })
  }
})
