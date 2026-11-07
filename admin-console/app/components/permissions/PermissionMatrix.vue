<script setup lang="ts">
/**
 * 権限マトリクス（リソース × 操作）
 * readonly で詳細画面の権限表示、編集モードで権限管理画面の設定 UI として共通利用する。
 */
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, HIGH_RISK_PERMISSIONS, normalizePermissions } from '~/utils/permissions'
import type { PermissionAction, PermissionKey } from '~/utils/permissions'

const props = withDefaults(defineProps<{
  readonly?: boolean
  /** 差分表示の基準（保存前の状態） */
  original?: PermissionKey[]
  /** 変更不可にする権限（自分自身の権限管理権限など） */
  locked?: PermissionKey[]
}>(), { readonly: false, original: undefined, locked: () => [] })

const model = defineModel<PermissionKey[]>({ default: () => [] })

const actions = Object.keys(PERMISSION_ACTIONS) as PermissionAction[]
const selected = computed(() => new Set<string>(model.value))
const originalSet = computed(() => props.original ? new Set<string>(props.original) : undefined)

function keyOf(resource: string, action: PermissionAction) {
  return `${resource}.${action}` as PermissionKey
}

function toggle(resource: string, action: PermissionAction, value: boolean) {
  const key = keyOf(resource, action)
  if (props.readonly || props.locked.includes(key)) return
  const next = new Set<string>(model.value)
  if (value) {
    next.add(key)
    if (action !== 'view') next.add(`${resource}.view`) // 編集・出力には閲覧が必要
  } else {
    next.delete(key)
    if (action === 'view') {
      // 閲覧を外すと他の操作も外れる（ロックされたものは残す）
      for (const a of actions) {
        const k = keyOf(resource, a)
        if (!props.locked.includes(k)) next.delete(k)
      }
    }
  }
  model.value = normalizePermissions(next)
}

function rowState(resource: typeof PERMISSION_RESOURCES[number]) {
  const keys = resource.actions.map(a => keyOf(resource.key, a))
  const count = keys.filter(k => selected.value.has(k)).length
  return count === 0 ? false : count === keys.length ? true : 'indeterminate'
}

function toggleRow(resource: typeof PERMISSION_RESOURCES[number], value: boolean) {
  if (props.readonly) return
  const next = new Set<string>(model.value)
  for (const a of resource.actions) {
    const key = keyOf(resource.key, a)
    if (props.locked.includes(key)) continue
    if (value) next.add(key)
    else next.delete(key)
  }
  model.value = normalizePermissions(next)
}

function cellDiff(key: PermissionKey) {
  if (!originalSet.value) return undefined
  const was = originalSet.value.has(key)
  const now = selected.value.has(key)
  return was === now ? undefined : now ? 'added' : 'removed'
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-default">
    <table class="w-full min-w-[34rem] text-sm">
      <thead class="bg-elevated/50 text-xs text-muted">
        <tr>
          <th class="px-4 py-2.5 text-left font-medium">
            機能
          </th>
          <th v-for="a in actions" :key="a" class="w-24 px-2 py-2.5 text-center font-medium">
            <span class="inline-flex items-center gap-1">
              <UIcon :name="PERMISSION_ACTIONS[a].icon" class="size-3.5" />
              {{ PERMISSION_ACTIONS[a].label }}
            </span>
          </th>
          <th v-if="!readonly" class="w-20 px-2 py-2.5 text-center font-medium">
            すべて
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-default">
        <tr v-for="r in PERMISSION_RESOURCES" :key="r.key" class="hover:bg-elevated/25">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <UIcon :name="r.icon" class="size-4 shrink-0 text-muted" />
              <div class="min-w-0">
                <p class="font-medium text-highlighted">
                  {{ r.label }}
                </p>
                <p class="text-xs text-muted">
                  {{ r.description }}
                </p>
              </div>
            </div>
          </td>
          <td v-for="a in actions" :key="a" class="px-2 py-3 text-center">
            <template v-if="(r.actions as readonly string[]).includes(a)">
              <div
                class="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1"
                :class="{
                  'bg-success/10 ring ring-success/30': cellDiff(keyOf(r.key, a)) === 'added',
                  'bg-error/10 ring ring-error/30': cellDiff(keyOf(r.key, a)) === 'removed'
                }"
              >
                <template v-if="readonly">
                  <UIcon
                    :name="selected.has(keyOf(r.key, a)) ? 'i-lucide-check' : 'i-lucide-x'"
                    :class="selected.has(keyOf(r.key, a)) ? 'size-4 text-primary' : 'size-4 text-dimmed'"
                    :aria-label="selected.has(keyOf(r.key, a)) ? '許可' : '不可'"
                  />
                </template>
                <UTooltip
                  v-else
                  :text="locked.includes(keyOf(r.key, a)) ? '自分自身のこの権限は外せません' : (r as any).notes?.[a]"
                  :disabled="!locked.includes(keyOf(r.key, a)) && !(r as any).notes?.[a]"
                >
                  <UCheckbox
                    :model-value="selected.has(keyOf(r.key, a))"
                    :disabled="locked.includes(keyOf(r.key, a))"
                    :color="HIGH_RISK_PERMISSIONS.includes(keyOf(r.key, a)) ? 'error' : 'primary'"
                    :aria-label="`${r.label} ${PERMISSION_ACTIONS[a].label}`"
                    @update:model-value="(v: boolean | 'indeterminate') => toggle(r.key, a, !!v)"
                  />
                </UTooltip>
                <UIcon v-if="HIGH_RISK_PERMISSIONS.includes(keyOf(r.key, a)) && selected.has(keyOf(r.key, a))" name="i-lucide-triangle-alert" class="size-3.5 text-warning" />
              </div>
            </template>
            <span v-else class="text-dimmed">—</span>
          </td>
          <td v-if="!readonly" class="px-2 py-3 text-center">
            <USwitch
              :model-value="rowState(r) === true"
              size="sm"
              :aria-label="`${r.label} をすべて許可`"
              @update:model-value="(v: boolean) => toggleRow(r, v)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
