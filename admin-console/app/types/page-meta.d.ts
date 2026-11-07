import type { PermissionKey } from '~/utils/permissions'

declare module '#app' {
  interface PageMeta {
    /** この画面の表示に必要な権限 */
    permission?: PermissionKey
  }
}

export {}
