import type { Column } from '@tanstack/table-core'
import type { BadgeProps } from '@nuxt/ui'
import { UAvatar, UBadge, UButton } from '#components'

/**
 * テーブル列定義のヘルパー（ソート可能ヘッダー・ステータスバッジなど）
 */
export function useTableColumns() {
  /** クリックでソートできる列ヘッダー */
  function sortable<T>(label: string, align: 'left' | 'right' = 'left') {
    return ({ column }: { column: Column<T, unknown> }) => {
      const sorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label,
        trailingIcon: sorted === 'asc' ? 'i-lucide-arrow-up' : sorted === 'desc' ? 'i-lucide-arrow-down' : 'i-lucide-chevrons-up-down',
        class: ['-mx-2.5 font-semibold', align === 'right' ? 'ms-auto -me-2.5 flex' : ''],
        ui: { trailingIcon: sorted ? 'text-primary' : 'text-dimmed' },
        onClick: () => column.toggleSorting(sorted === 'asc')
      })
    }
  }

  /** ステータス定義（utils/labels.ts）を使ったバッジ */
  function statusBadge(meta?: { label: string, color: BadgeProps['color'], icon?: string }) {
    if (!meta) return '—'
    return h(UBadge, { label: meta.label, color: meta.color, variant: 'subtle', icon: meta.icon, size: 'md' })
  }

  /** アバター + 主表示 + 補足 */
  function identity(name: string, sub?: string) {
    return h('div', { class: 'flex items-center gap-3 min-w-0' }, [
      h(UAvatar, { alt: name, size: 'md' }),
      h('div', { class: 'min-w-0' }, [
        h('p', { class: 'font-medium text-highlighted truncate' }, name),
        sub ? h('p', { class: 'text-xs text-muted truncate' }, sub) : null
      ])
    ])
  }

  return { sortable, statusBadge, identity, UButton, UBadge, UAvatar }
}
