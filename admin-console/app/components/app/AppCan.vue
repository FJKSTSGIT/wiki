<script setup lang="ts">
/**
 * 権限によって中身の表示を切り替える
 *   <AppCan permission="users.edit"> <UButton ... /> </AppCan>
 *   <AppCan permission="users.edit" mode="disable"> ... </AppCan>  // 非表示ではなく無効化して理由を表示
 */
import type { PermissionKey } from '~/utils/permissions'

const props = withDefaults(defineProps<{
  permission?: PermissionKey | PermissionKey[]
  match?: 'all' | 'any'
  /** hide: 権限が無ければ描画しない / disable: 無効化してツールチップで理由を表示 */
  mode?: 'hide' | 'disable'
}>(), { match: 'all', mode: 'hide' })

defineSlots<{
  default(props: { allowed: boolean }): any
  fallback(props: object): any
}>()

const { can } = usePermission()
const allowed = computed(() => can(props.permission, props.match))
const required = computed(() => [props.permission].flat().filter(Boolean).map(p => permissionLabel(p!)).join(', '))
</script>

<template>
  <slot v-if="allowed" :allowed="true" />
  <UTooltip v-else-if="mode === 'disable'" :text="`権限が必要です：${required}`">
    <span class="inline-flex cursor-not-allowed">
      <span class="pointer-events-none inline-flex opacity-50" aria-disabled="true">
        <slot :allowed="false" />
      </span>
    </span>
  </UTooltip>
  <slot v-else name="fallback" />
</template>
