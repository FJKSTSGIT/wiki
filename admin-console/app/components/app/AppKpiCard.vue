<script setup lang="ts">
/**
 * KPI カード
 * 値・前期間比・ミニ推移グラフ（任意）を表示する。
 */
const props = withDefaults(defineProps<{
  title: string
  value: string
  icon?: string
  /** 前期間比（0.12 = +12%） */
  delta?: number
  deltaLabel?: string
  /** 増加が悪化を意味する指標（解約率など）は true */
  invert?: boolean
  /** ミニ推移グラフ用の値 */
  trend?: number[]
  hint?: string
  to?: string
}>(), { deltaLabel: '前期間比', invert: false })

const positive = computed(() => (props.delta ?? 0) >= 0)
const good = computed(() => (props.invert ? !positive.value : positive.value))
const trendData = computed(() => props.trend?.map((v, i) => ({ i, v })) ?? [])
</script>

<template>
  <UPageCard
    :to="to"
    variant="outline"
    :ui="{ container: 'gap-y-3 p-4 sm:p-5', wrapper: 'items-start', body: 'w-full' }"
  >
    <template #body>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="flex items-center gap-1.5 text-xs font-medium text-muted">
            {{ title }}
            <UTooltip v-if="hint" :text="hint">
              <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" />
            </UTooltip>
          </p>
          <p class="mt-1.5 text-2xl font-semibold tracking-tight text-highlighted tabular-nums">
            {{ value }}
          </p>
        </div>
        <div v-if="icon" class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring ring-primary/20 ring-inset">
          <UIcon :name="icon" class="size-4.5 text-primary" />
        </div>
      </div>

      <div class="mt-3 flex items-end justify-between gap-3">
        <div v-if="delta !== undefined" class="flex items-center gap-1.5 text-xs">
          <UBadge
            :color="good ? 'success' : 'error'"
            variant="subtle"
            size="sm"
            :icon="positive ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
            :label="`${positive ? '+' : ''}${(delta * 100).toFixed(1)}%`"
            class="tabular-nums"
          />
          <span class="text-muted">{{ deltaLabel }}</span>
        </div>
        <div v-if="trendData.length" class="w-24 shrink-0">
          <UChart
            type="area"
            curve="monotone"
            :data="trendData"
            index="i"
            :categories="['v']"
            :colors="[good ? 'var(--ui-success)' : 'var(--ui-error)']"
            :x-axis="false"
            :y-axis="false"
            :grid="false"
            :legend="false"
            :tooltip="false"
            :height="32"
            :initial-width="96"
            :aria-label="`${title}の推移`"
          />
        </div>
      </div>
    </template>
  </UPageCard>
</template>
