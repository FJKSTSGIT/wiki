import { AppConfirmDialog } from '#components'
import type { ConfirmDialogProps } from '~/components/app/AppConfirmDialog.vue'

/**
 * Promise ベースの確認ダイアログ
 *   const confirm = useConfirm()
 *   if (await confirm({ title: '削除しますか？', color: 'error' })) { ... }
 */
export function useConfirm() {
  const overlay = useOverlay()
  const modal = overlay.create(AppConfirmDialog, { destroyOnClose: true })

  return async (options: ConfirmDialogProps): Promise<boolean> => {
    const result = await modal.open(options)
    return result === true
  }
}
