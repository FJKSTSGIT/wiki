<script setup lang="ts">
/**
 * 1 画面分のプレビュー
 * 画面の型（一覧・詳細・入力・ダッシュボード）と選んだレイアウトに合わせて、オンにしたブロックを並べる。
 */
import type { BlockDef, ScreenSpec } from '~/utils/screens'

const props = defineProps<{
  spec: ScreenSpec
  layout: string
  blocks: BlockDef[]
  title: string
  description?: string
}>()

const SIDE_KINDS = ['kpis', 'kv', 'list', 'alert', 'phone', 'rates', 'profile']
const PREVIEW_KINDS = ['phone', 'rates', 'diff', 'kv', 'kpis', 'alert']

const profile = computed(() => props.blocks.find(b => b.kind === 'profile'))
const rest = computed(() => props.blocks.filter(b => b !== profile.value))

/* 一覧 */
const mainTable = computed(() => props.blocks.find(b => b.kind === 'table'))
const listTop = computed(() => props.blocks.filter(b => b !== mainTable.value && b.kind !== 'table'))
const otherTables = computed(() => props.blocks.filter(b => b.kind === 'table' && b !== mainTable.value))
const selectedRow = ref<{ row: string[], columns: string[] }>()
watch(mainTable, () => { selectedRow.value = undefined })
const splitRow = computed(() => {
  if (selectedRow.value) return selectedRow.value
  const t = mainTable.value
  return t && t.kind === 'table' ? { row: t.data.rows[0] ?? [], columns: t.data.columns } : undefined
})

/* 詳細 */
const tabValue = ref<string>()
watch(rest, (r) => { if (!r.some(b => b.id === tabValue.value)) tabValue.value = r[0]?.id }, { immediate: true })
const mainBlocks = computed(() => rest.value.filter(b => !SIDE_KINDS.includes(b.kind)))
const sideBlocks = computed(() => rest.value.filter(b => SIDE_KINDS.includes(b.kind)))

/* 入力 */
const step = ref(0)
watch(() => props.blocks.length, () => { step.value = Math.min(step.value, props.blocks.length) })
const inputBlocks = computed(() => props.blocks.filter(b => !PREVIEW_KINDS.includes(b.kind)))
const previewBlocks = computed(() => props.blocks.filter(b => PREVIEW_KINDS.includes(b.kind)))

/* ダッシュボード */
const kpiBlocks = computed(() => props.blocks.filter(b => b.kind === 'kpis'))
const focusChart = computed(() => props.blocks.find(b => ['line', 'bars', 'heatmap'].includes(b.kind)))
const dashRest = computed(() => props.blocks.filter(b => b.kind !== 'kpis' && (props.layout !== 'focus' || b !== focusChart.value)))
</script>

<template>
  <div class="@container flex flex-col gap-4">
    <!-- 画面の見出し -->
    <div class="flex flex-wrap items-start gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-semibold text-highlighted">
          {{ title }}
        </h3>
        <p v-if="description" class="text-xs text-muted">
          {{ description }}
        </p>
      </div>
      <div v-if="spec.actions?.length && spec.type !== 'form'" class="flex flex-wrap gap-1.5">
        <UButton v-for="a in spec.actions" :key="a[0]" :label="a[0]" :icon="a[2]" :color="a[1]" :variant="a[1] === 'neutral' ? 'outline' : a[1] === 'error' ? 'soft' : 'solid'" size="sm" />
      </div>
    </div>

    <UEmpty v-if="!blocks.length" icon="i-lucide-eye-off" title="表示する項目がありません" description="「画面の中身」で表示する項目をオンにしてください" size="sm" />

    <!-- ===== 一覧 ===== -->
    <template v-else-if="spec.type === 'list'">
      <div v-for="b in listTop" :key="b.id">
        <ScreenBlock :block="b" />
      </div>

      <template v-if="mainTable">
        <div v-if="layout === 'split'" class="grid gap-3 @lg:grid-cols-[1fr_13rem]">
          <ScreenBlock :block="mainTable" @row-select="(row, columns) => selectedRow = { row, columns }" />
          <div v-if="splitRow" class="space-y-2 rounded-md border border-default p-3">
            <p class="text-xs font-semibold text-highlighted">
              {{ splitRow.row[1] ?? splitRow.row[0] }}
            </p>
            <dl class="space-y-1.5 text-xs">
              <div v-for="(c, i) in splitRow.columns" :key="c" class="flex justify-between gap-2">
                <dt class="text-muted">
                  {{ c }}
                </dt>
                <dd class="truncate text-highlighted">
                  {{ splitRow.row[i] }}
                </dd>
              </div>
            </dl>
            <UButton label="詳細を開く" size="xs" block color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right" />
          </div>
        </div>

        <div v-else-if="layout === 'cards' && mainTable.kind === 'table'" class="grid gap-2 @md:grid-cols-2 @3xl:grid-cols-3">
          <div v-for="(r, ri) in mainTable.data.rows" :key="ri" class="space-y-2 rounded-md border border-default p-3">
            <div class="flex items-start gap-2">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                {{ (r[1] ?? r[0] ?? '').slice(0, 1) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ r[1] ?? r[0] }}
                </p>
                <p class="truncate text-[11px] text-muted">
                  {{ r[0] }}
                </p>
              </div>
              <UBadge v-if="mainTable.data.status !== undefined" :label="r[mainTable.data.status]" variant="subtle" size="sm" />
            </div>
            <dl class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
              <template v-for="(c, ci) in mainTable.data.columns" :key="c">
                <template v-if="ci > 1 && ci !== mainTable.data.status">
                  <dt class="text-muted">
                    {{ c }}
                  </dt>
                  <dd class="truncate text-right text-highlighted">
                    {{ r[ci] }}
                  </dd>
                </template>
              </template>
            </dl>
          </div>
        </div>

        <ScreenBlock v-else :block="mainTable" />
      </template>

      <div v-for="b in otherTables" :key="b.id" class="space-y-1.5">
        <p class="text-xs font-semibold text-highlighted">
          {{ b.label }}
        </p>
        <ScreenBlock :block="b" />
      </div>
    </template>

    <!-- ===== 詳細 ===== -->
    <template v-else-if="spec.type === 'detail'">
      <div v-if="profile" class="rounded-md border border-default p-3">
        <ScreenBlock :block="profile" />
      </div>

      <template v-if="layout === 'tabs' && rest.length">
        <div class="flex gap-1 overflow-x-auto border-b border-default">
          <button
            v-for="b in rest"
            :key="b.id"
            type="button"
            class="shrink-0 border-b-2 px-3 py-2 text-xs font-medium transition-colors"
            :class="b.id === tabValue ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-highlighted'"
            @click="tabValue = b.id"
          >
            {{ b.label }}
          </button>
        </div>
        <ScreenBlock v-if="rest.find(b => b.id === tabValue)" :block="rest.find(b => b.id === tabValue)!" />
      </template>

      <div v-else-if="layout === 'columns'" class="grid gap-4 @lg:grid-cols-[1fr_13rem]">
        <div class="min-w-0 space-y-4">
          <section v-for="b in (mainBlocks.length ? mainBlocks : sideBlocks)" :key="b.id" class="space-y-1.5">
            <p class="text-xs font-semibold text-highlighted">
              {{ b.label }}
            </p>
            <ScreenBlock :block="b" />
          </section>
        </div>
        <div v-if="mainBlocks.length" class="min-w-0 space-y-4">
          <section v-for="b in sideBlocks" :key="b.id" class="space-y-1.5">
            <p class="text-xs font-semibold text-highlighted">
              {{ b.label }}
            </p>
            <ScreenBlock :block="b" compact />
          </section>
        </div>
      </div>

      <template v-else>
        <section v-for="b in rest" :key="b.id" class="space-y-1.5">
          <p class="text-xs font-semibold text-highlighted">
            {{ b.label }}
          </p>
          <ScreenBlock :block="b" />
        </section>
      </template>
    </template>

    <!-- ===== 入力・設定 ===== -->
    <template v-else-if="spec.type === 'form'">
      <template v-if="layout === 'steps'">
        <ol class="flex flex-wrap gap-1.5">
          <li v-for="(b, i) in [...blocks, { id: '__confirm', label: '確認' }]" :key="b.id">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              :class="i === step ? 'border-primary bg-primary/10 text-primary' : i < step ? 'border-default text-highlighted' : 'border-default text-muted'"
              @click="step = i"
            >
              <span class="flex size-4 items-center justify-center rounded-full text-[10px]" :class="i < step ? 'bg-primary text-inverted' : 'bg-elevated'">
                <UIcon v-if="i < step" name="i-lucide-check" class="size-3" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              {{ b.label }}
            </button>
          </li>
        </ol>
        <div class="rounded-md border border-default p-4">
          <template v-if="step < blocks.length">
            <p class="mb-3 text-sm font-semibold text-highlighted">
              {{ blocks[step]!.label }}
            </p>
            <ScreenBlock :block="blocks[step]!" />
          </template>
          <div v-else class="space-y-2 text-xs">
            <p class="text-sm font-semibold text-highlighted">
              入力内容の確認
            </p>
            <p v-for="b in blocks" :key="b.id" class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-success" />{{ b.label }}
            </p>
          </div>
        </div>
        <div class="flex justify-between gap-2">
          <UButton label="戻る" color="neutral" variant="ghost" size="sm" :disabled="step === 0" @click="step--" />
          <UButton v-if="step < blocks.length" label="次へ" size="sm" trailing-icon="i-lucide-arrow-right" @click="step++" />
          <div v-else class="flex gap-1.5">
            <UButton v-for="a in spec.actions ?? []" :key="a[0]" :label="a[0]" :icon="a[2]" :color="a[1]" :variant="a[1] === 'neutral' ? 'outline' : 'solid'" size="sm" />
          </div>
        </div>
      </template>

      <template v-else>
        <div :class="layout === 'preview' && previewBlocks.length && inputBlocks.length ? 'grid gap-4 @lg:grid-cols-[1fr_13rem]' : ''">
          <div class="min-w-0 space-y-5 rounded-md border border-default p-4">
            <section v-for="b in (layout === 'preview' && inputBlocks.length ? inputBlocks : blocks)" :key="b.id" class="space-y-2">
              <p class="text-xs font-semibold text-highlighted">
                {{ b.label }}
              </p>
              <ScreenBlock :block="b" />
            </section>
            <div class="flex justify-end gap-1.5 border-t border-default pt-3">
              <UButton v-for="a in spec.actions ?? []" :key="a[0]" :label="a[0]" :icon="a[2]" :color="a[1]" :variant="a[1] === 'neutral' ? 'outline' : 'solid'" size="sm" />
            </div>
          </div>
          <div v-if="layout === 'preview' && previewBlocks.length && inputBlocks.length" class="min-w-0 space-y-4 @lg:sticky @lg:top-2 @lg:self-start">
            <section v-for="b in previewBlocks" :key="b.id" class="space-y-1.5">
              <p class="text-xs font-semibold text-highlighted">
                {{ b.label }}
              </p>
              <ScreenBlock :block="b" compact />
            </section>
          </div>
        </div>
      </template>
    </template>

    <!-- ===== ダッシュボード ===== -->
    <template v-else>
      <ScreenBlock v-for="b in kpiBlocks" :key="b.id" :block="b" />
      <section v-if="layout === 'focus' && focusChart" class="space-y-1.5">
        <p class="text-xs font-semibold text-highlighted">
          {{ focusChart.label }}
        </p>
        <ScreenBlock :block="focusChart" />
      </section>
      <div class="grid gap-4" :class="layout === 'grid' ? '@xl:grid-cols-2' : '@xl:grid-cols-2'">
        <section v-for="b in dashRest" :key="b.id" class="min-w-0 space-y-1.5">
          <p class="text-xs font-semibold text-highlighted">
            {{ b.label }}
          </p>
          <ScreenBlock :block="b" compact />
        </section>
      </div>
    </template>
  </div>
</template>
