<script setup lang="ts">
/**
 * 権限による表示の切替
 *
 * mode
 *  - hide    : 権限が無ければ何も表示しない（メニュー・ボタン向け）
 *  - disable : 表示はするが操作不可。理由をツールチップで出す（「できない」ことを知らせたいとき）
 *  - mask    : 中身を伏せて「権限がありません」を出す（売上などの数値・個人情報向け）
 *
 *   <AccessGuard permission="notice.publish" mode="disable"><UButton label="公開" /></AccessGuard>
 */
import { PERMISSIONS, type Permission } from '~/utils/access'

const props = withDefaults(defineProps<{
  permission?: Permission | Permission[]
  match?: 'all' | 'any'
  mode?: 'hide' | 'disable' | 'mask'
}>(), { match: 'all', mode: 'hide' })

defineSlots<{
  default(props: { allowed: boolean }): any
  fallback?(props: object): any
}>()

const { can } = useAccess()
const allowed = computed(() => can(props.permission, props.match))
const reason = computed(() => [props.permission].flat().filter(Boolean).map(p => PERMISSIONS[p!]).join('・'))
</script>

<template>
  <slot v-if="allowed" :allowed="true" />

  <UTooltip v-else-if="mode === 'disable'" :text="`権限が必要です：${reason}`">
    <span class="inline-flex cursor-not-allowed" tabindex="0" :aria-label="`権限が必要です：${reason}`">
      <span class="pointer-events-none inline-flex opacity-50" aria-hidden="true">
        <slot :allowed="false" />
      </span>
    </span>
  </UTooltip>

  <div
    v-else-if="mode === 'mask'"
    class="flex items-center gap-2 rounded-md border border-dashed border-default bg-elevated/40 px-3 py-2 text-sm text-muted"
  >
    <UIcon name="i-lucide-lock" class="size-4 shrink-0" />
    <span>閲覧権限がありません（{{ reason }}）</span>
  </div>

  <slot v-else name="fallback" />
</template>
