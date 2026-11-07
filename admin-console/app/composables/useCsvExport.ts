import type { CsvColumn } from '~/utils/csv'
import type { PermissionKey } from '~/utils/permissions'

export interface CsvExportOptions<T> {
  /** ファイル名のベース（日時が自動付与される） */
  filename: string
  columns: CsvColumn<T>[]
  /** 出力に必要な権限。未指定なら誰でも出力可 */
  permission?: PermissionKey
  /** 操作ログ上の対象名 */
  label?: string
}

/**
 * CSV 出力の共通処理
 * 権限チェック → CSV 生成 → ダウンロード → 操作ログ記録 → トースト通知 までを一括で行う。
 * 本番で件数が多い場合は、同じインターフェースのままサーバー側生成（非同期ジョブ）に差し替える想定。
 */
export function useCsvExport() {
  const toast = useToast()
  const { can } = usePermission()
  const { record } = useAuditLog()

  function exportCsv<T>(rows: readonly T[], options: CsvExportOptions<T>, context?: { conditions?: string }) {
    if (options.permission && !can(options.permission)) {
      toast.add({ title: 'CSV を出力する権限がありません', description: options.permission, color: 'error', icon: 'i-lucide-shield-alert' })
      return false
    }
    if (!rows.length) {
      toast.add({ title: '出力対象のデータがありません', color: 'warning', icon: 'i-lucide-info' })
      return false
    }

    const name = csvFilename(options.filename)
    downloadCsv(name, toCsv(rows, options.columns))

    record({
      category: 'export',
      action: 'CSV を出力',
      target: options.label ?? options.filename,
      detail: [`${rows.length.toLocaleString()} 件`, context?.conditions].filter(Boolean).join(' / ')
    })

    toast.add({
      title: 'CSV をダウンロードしました',
      description: `${name}（${rows.length.toLocaleString()} 件）`,
      color: 'success',
      icon: 'i-lucide-file-check-2'
    })
    return true
  }

  return { exportCsv }
}
