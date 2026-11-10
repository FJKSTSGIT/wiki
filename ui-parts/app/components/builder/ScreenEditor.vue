<script setup lang="ts">
/** 画面の中身（レイアウトと表示する項目）の選択 */
import { SCREEN_TYPES, resolveScreen, type ScreenChoice, type ScreenSpec } from '~/utils/screens'

const props = defineProps<{
  spec: ScreenSpec
  choice?: ScreenChoice
  name: string
  disabled?: boolean
}>()
const emit = defineEmits<{ change: [choice: ScreenChoice] }>()

const type = computed(() => SCREEN_TYPES[props.spec.type])
const resolved = computed(() => resolveScreen(props.spec, props.choice))
const enabledIds = computed(() => resolved.value.blocks.map(b => b.id))
const customized = computed(() => !!props.choice && (props.choice.layout !== undefined || props.choice.blocks !== undefined))

function setLayout(layout: string) {
  emit('change', { ...props.choice, layout })
}
function toggleBlock(id: string, on: boolean) {
  const set = new Set(enabledIds.value)
  if (on) set.add(id)
  else set.delete(id)
  emit('change', { ...props.choice, blocks: props.spec.blocks.filter(b => set.has(b.id)).map(b => b.id) })
}
function reset() {
  emit('change', { layout: type.value.layouts[0]!.value, blocks: props.spec.blocks.filter(b => !b.off).map(b => b.id) })
}
</script>

<template>
  <div class="space-y-3 rounded-lg border border-default p-3">
    <div class="flex flex-wrap items-center gap-2">
      <UIcon name="i-lucide-layout-panel-left" class="size-4 text-primary" />
      <p class="text-sm font-semibold text-highlighted">
        画面の中身：{{ name }}
      </p>
      <UBadge :label="type.label" color="neutral" variant="outline" size="sm" />
      <UButton v-if="customized && !disabled" label="初期設定に戻す" size="xs" color="neutral" variant="link" class="ms-auto" @click="reset" />
    </div>

    <div>
      <p class="mb-1.5 text-xs text-muted">
        レイアウト
      </p>
      <div class="grid gap-2 sm:grid-cols-3">
        <button
          v-for="l in type.layouts"
          :key="l.value"
          type="button"
          class="flex items-start gap-2 rounded-md border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :class="resolved.layout === l.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-default hover:bg-elevated/50'"
          :disabled="disabled"
          :aria-pressed="resolved.layout === l.value"
          @click="setLayout(l.value)"
        >
          <UIcon :name="l.icon" class="mt-0.5 size-4 shrink-0" :class="resolved.layout === l.value ? 'text-primary' : 'text-muted'" />
          <span class="min-w-0">
            <span class="block text-xs font-medium text-highlighted">{{ l.label }}</span>
            <span class="block text-[11px] leading-snug text-muted">{{ l.description }}</span>
          </span>
        </button>
      </div>
    </div>

    <div>
      <p class="mb-1.5 text-xs text-muted">
        表示する項目（{{ enabledIds.length }} / {{ spec.blocks.length }}）
      </p>
      <div class="flex flex-wrap gap-1.5">
        <label
          v-for="b in spec.blocks"
          :key="b.id"
          class="flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
          :class="enabledIds.includes(b.id) ? 'border-primary/40 bg-primary/5 text-highlighted' : 'border-default text-muted'"
        >
          <UCheckbox
            :model-value="enabledIds.includes(b.id)"
            :disabled="disabled"
            size="sm"
            :aria-label="b.label"
            @update:model-value="(v: boolean | 'indeterminate') => toggleBlock(b.id, !!v)"
          />
          {{ b.label }}
        </label>
      </div>
    </div>
  </div>
</template>
