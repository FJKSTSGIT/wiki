<script setup lang="ts">
/** 画面ブロックの描画（表・指標・グラフ・フォーム・タイムラインなど） */
import type { BlockDef } from '~/utils/screens'

const props = defineProps<{ block: BlockDef, compact?: boolean }>()
const emit = defineEmits<{ rowSelect: [row: string[], columns: string[]] }>()
const selectedRow = ref(0)

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  有効: 'success', 公開中: 'success', 開催中: 'success', 完了: 'success', 販売中: 'success', 表示中: 'success', 正常: 'success', 承認済み: 'success', 確認済み: 'success', 最新: 'success', OK: 'success', ON: 'success', 問題なし: 'neutral',
  予約: 'info', 予定: 'info', 招待中: 'info', 対応中: 'info', 審査中: 'info', 実行中: 'info', 配布中: 'info', 確認中: 'info', 準備中: 'info',
  承認待ち: 'warning', 未対応: 'warning', 要更新: 'warning', 休眠: 'neutral', 終了: 'neutral', 返金済: 'neutral', OFF: 'neutral', 警告: 'warning',
  停止中: 'error', 停止済み: 'error', エラー: 'error', 除外: 'error'
}
const statusColor = (v: string) => STATUS_COLOR[v] ?? (v.startsWith('ON') ? 'success' : 'neutral')

const lineChart = computed(() => {
  if (props.block.kind !== 'line') return undefined
  const { values, compare } = props.block.data
  const all = [...values, ...(compare ?? [])]
  const max = Math.max(...all) * 1.1
  const min = Math.min(0, ...all)
  const pts = (vs: number[]) => vs.map((v, i) => `${(i / (vs.length - 1)) * 100},${40 - ((v - min) / (max - min)) * 40}`).join(' ')
  return { main: pts(values), compare: compare ? pts(compare) : '', last: values.length - 1, lastY: 40 - ((values[values.length - 1]! - min) / (max - min)) * 40 }
})

const ratesTotal = computed(() => props.block.kind === 'rates' ? props.block.data.rows.reduce((s, r) => s + r[2], 0) : 0)
const heatColor = (v: number) => (v ? `color-mix(in oklab, var(--ui-primary) ${Math.min(90, v * 1.6)}%, transparent)` : 'transparent')
</script>

<template>
  <div class="min-w-0">
    <!-- 検索・絞り込み -->
    <div v-if="block.kind === 'filters'" class="flex flex-wrap items-center gap-2">
      <UInput :placeholder="block.data.search" icon="i-lucide-search" size="sm" class="w-full sm:w-64" readonly />
      <UButton v-for="i in block.data.items" :key="i" :label="i" size="sm" color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" />
    </div>

    <!-- 表 -->
    <div v-else-if="block.kind === 'table'" class="overflow-x-auto rounded-md border border-default">
      <table class="w-full text-xs">
        <thead class="bg-elevated/60 text-muted">
          <tr>
            <th v-for="(c, i) in block.data.columns" :key="c" class="whitespace-nowrap px-3 py-2 font-medium" :class="block.data.numeric?.includes(i) ? 'text-right' : 'text-left'">
              {{ c }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr
            v-for="(r, ri) in block.data.rows"
            :key="ri"
            class="cursor-pointer hover:bg-elevated/40"
            :class="ri === selectedRow ? 'bg-primary/5' : ''"
            @click="selectedRow = ri; emit('rowSelect', r, block.data.columns)"
          >
            <td v-for="(v, ci) in r" :key="ci" class="whitespace-nowrap px-3 py-2" :class="[block.data.numeric?.includes(ci) ? 'text-right tabular-nums' : '', ci === 0 || ci === 1 ? 'text-highlighted' : 'text-default']">
              <UBadge v-if="ci === block.data.status" :label="v" :color="statusColor(v)" variant="subtle" size="sm" />
              <template v-else>
                {{ v }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 指標 -->
    <div v-else-if="block.kind === 'kpis'" class="grid gap-2" :class="compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'">
      <div v-for="k in block.data.items" :key="k[0]" class="rounded-md border border-default px-3 py-2">
        <p class="truncate text-[11px] text-muted">
          {{ k[0] }}
        </p>
        <p class="truncate font-semibold text-highlighted tabular-nums" :class="compact ? 'text-sm' : 'text-base'" :title="k[1]">
          {{ k[1] }}
        </p>
        <p v-if="k[2]" class="text-[11px] tabular-nums" :class="k[2].startsWith('-') || k[2].startsWith('−') ? 'text-error' : 'text-success'">
          {{ k[2] }}
        </p>
      </div>
    </div>

    <!-- 棒グラフ -->
    <div v-else-if="block.kind === 'bars'" class="space-y-1.5">
      <div v-for="(l, i) in block.data.labels" :key="l" class="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-2 text-xs">
        <span class="truncate text-muted">{{ l }}</span>
        <div class="h-4 overflow-hidden rounded-sm bg-elevated">
          <div class="h-full rounded-sm bg-primary/70" :style="{ width: `${(block.data.values[i]! / Math.max(...block.data.values)) * 100}%` }" />
        </div>
        <span class="text-right text-highlighted tabular-nums">{{ block.data.values[i] }}{{ block.data.unit ?? '' }}</span>
      </div>
    </div>

    <!-- 折れ線 -->
    <div v-else-if="block.kind === 'line' && lineChart" class="rounded-md border border-default p-3">
      <svg viewBox="-2 -4 104 50" class="h-36 w-full overflow-visible" preserveAspectRatio="none" role="img" :aria-label="block.label">
        <line v-for="y in [0, 13.3, 26.6, 40]" :key="y" x1="0" x2="100" :y1="y" :y2="y" stroke="var(--ui-border)" stroke-width="0.3" vector-effect="non-scaling-stroke" />
        <polyline v-if="lineChart.compare" :points="lineChart.compare" fill="none" stroke="var(--ui-border-accented)" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-dasharray="4 3" />
        <polygon :points="`0,40 ${lineChart.main} 100,40`" fill="var(--ui-primary)" fill-opacity="0.12" />
        <polyline :points="lineChart.main" fill="none" stroke="var(--ui-primary)" stroke-width="2" vector-effect="non-scaling-stroke" />
        <circle cx="100" :cy="lineChart.lastY" r="1.6" fill="var(--ui-primary)" />
      </svg>
      <div class="mt-1 flex justify-between text-[10px] text-muted">
        <span v-for="l in block.data.labels" :key="l">{{ l }}</span>
      </div>
      <p v-if="block.data.compare" class="mt-1 text-[10px] text-muted">
        点線：前の期間
      </p>
    </div>

    <!-- 項目と値 -->
    <dl v-else-if="block.kind === 'kv'" class="divide-y divide-default rounded-md border border-default text-xs">
      <div v-for="i in block.data.items" :key="i[0]" class="grid grid-cols-[7rem_1fr] gap-2 px-3 py-2">
        <dt class="text-muted">
          {{ i[0] }}
        </dt>
        <dd class="min-w-0 break-words text-highlighted">
          {{ i[1] }}
        </dd>
      </div>
    </dl>

    <!-- プロフィール -->
    <div v-else-if="block.kind === 'profile'" class="flex flex-wrap items-center gap-3">
      <UAvatar :alt="block.data.name" size="lg" />
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-highlighted">
          {{ block.data.name }}
        </p>
        <p class="truncate text-xs text-muted">
          {{ block.data.sub }}
        </p>
      </div>
      <div class="flex flex-wrap gap-1">
        <UBadge v-for="b in block.data.badges" :key="b[0]" :label="b[0]" :color="b[1]" variant="subtle" size="sm" />
      </div>
    </div>

    <!-- タイムライン -->
    <ol v-else-if="block.kind === 'timeline'" class="relative space-y-3 border-s border-default ps-4 text-xs">
      <li v-for="(t, i) in block.data.items" :key="i" class="relative">
        <span class="absolute -start-[1.3rem] top-1 size-2 rounded-full bg-primary" />
        <p class="text-[11px] text-muted tabular-nums">
          {{ t[0] }}
        </p>
        <p class="text-highlighted">
          {{ t[1] }}
        </p>
        <p v-if="t[2]" class="text-muted">
          {{ t[2] }}
        </p>
      </li>
    </ol>

    <!-- フォーム -->
    <div v-else-if="block.kind === 'form'" class="grid gap-3" :class="compact ? '' : 'sm:grid-cols-2'">
      <div v-for="fd in block.data.fields" :key="fd.label" :class="fd.type === 'textarea' || fd.type === 'checkbox' || fd.type === 'radio' ? 'sm:col-span-2' : ''">
        <p class="mb-1 text-xs font-medium text-highlighted">
          {{ fd.label }}
        </p>
        <UTextarea v-if="fd.type === 'textarea'" :model-value="fd.value" :rows="3" size="sm" class="w-full" readonly />
        <USwitch v-else-if="fd.type === 'switch'" :model-value="fd.value !== 'オフ' && fd.value !== 'なし'" :label="fd.value" size="sm" />
        <div v-else-if="fd.type === 'radio' || fd.type === 'checkbox'" class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="o in fd.options"
            :key="o"
            :label="o"
            :color="fd.type === 'checkbox' || o === fd.value ? 'primary' : 'neutral'"
            :variant="fd.type === 'checkbox' || o === fd.value ? 'soft' : 'outline'"
            :icon="fd.type === 'checkbox' ? 'i-lucide-check' : o === fd.value ? 'i-lucide-circle-dot' : 'i-lucide-circle'"
          />
        </div>
        <UInput
          v-else
          :model-value="fd.value"
          size="sm"
          class="w-full"
          readonly
          :trailing-icon="fd.type === 'select' ? 'i-lucide-chevron-down' : fd.type === 'date' ? 'i-lucide-calendar' : undefined"
        />
      </div>
    </div>

    <!-- 注意 -->
    <UAlert v-else-if="block.kind === 'alert'" :color="block.data.color" variant="subtle" :title="block.data.title" :description="block.data.text" :icon="block.data.color === 'success' ? 'i-lucide-circle-check' : 'i-lucide-triangle-alert'" />

    <!-- 確率表 -->
    <div v-else-if="block.kind === 'rates'" class="space-y-2">
      <div class="overflow-hidden rounded-md border border-default">
        <div v-for="r in block.data.rows" :key="r[1]" class="flex items-center gap-2 border-b border-default px-3 py-2 text-xs last:border-b-0">
          <UBadge :label="r[0]" :color="r[0] === 'SSR' ? 'warning' : r[0] === 'SR' ? 'primary' : 'neutral'" size="sm" />
          <span class="min-w-0 flex-1 truncate text-highlighted">{{ r[1] }}</span>
          <div class="hidden h-1.5 w-24 overflow-hidden rounded-full bg-elevated sm:block">
            <div class="h-full bg-primary" :style="{ width: `${Math.max(2, r[2])}%` }" />
          </div>
          <span class="w-16 text-right tabular-nums">{{ r[2].toFixed(3) }}%</span>
        </div>
      </div>
      <p class="text-right text-xs tabular-nums" :class="Math.abs(ratesTotal - 100) < 0.001 ? 'text-success' : 'text-error'">
        合計 {{ ratesTotal.toFixed(3) }}%
      </p>
    </div>

    <!-- カレンダー -->
    <div v-else-if="block.kind === 'calendar'" class="overflow-x-auto">
      <div class="grid min-w-[28rem] grid-cols-7 gap-px overflow-hidden rounded-md border border-default bg-(--ui-border) text-[10px]">
        <div v-for="w in ['日', '月', '火', '水', '木', '金', '土']" :key="w" class="bg-elevated/60 px-1 py-1 text-center text-muted">
          {{ w }}
        </div>
        <div v-for="d in 28" :key="d" class="relative h-14 bg-default p-1">
          <span class="text-muted tabular-nums">{{ d }}</span>
          <template v-for="e in block.data.events" :key="e[2]">
            <div
              v-if="d >= e[0] && d < e[0] + e[1]"
              class="mt-0.5 truncate rounded-sm px-1"
              :class="{ 'bg-primary/15 text-primary': e[3] === 'primary', 'bg-warning/15 text-warning': e[3] === 'warning', 'bg-success/15 text-success': e[3] === 'success', 'bg-error/15 text-error': e[3] === 'error', 'bg-info/15 text-info': e[3] === 'info', 'bg-elevated text-muted': e[3] === 'neutral' }"
            >
              {{ d === e[0] || d % 7 === 1 ? e[2] : ' ' }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 差分 -->
    <div v-else-if="block.kind === 'diff'" class="overflow-x-auto rounded-md border border-default">
      <table class="w-full text-xs">
        <thead class="bg-elevated/60 text-left text-muted">
          <tr>
            <th class="px-3 py-2 font-medium">
              対象
            </th>
            <th class="px-3 py-2 font-medium">
              項目
            </th>
            <th class="px-3 py-2 font-medium">
              変更前
            </th>
            <th class="px-3 py-2 font-medium">
              変更後
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="(r, i) in block.data.rows" :key="i">
            <td class="px-3 py-2 text-highlighted">
              {{ r[0] }}
            </td>
            <td class="px-3 py-2">
              {{ r[1] }}
            </td>
            <td class="px-3 py-2">
              <span class="rounded-sm bg-error/10 px-1 text-error line-through">{{ r[2] }}</span>
            </td>
            <td class="px-3 py-2">
              <span class="rounded-sm bg-success/10 px-1 text-success">{{ r[3] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ゲーム画面のプレビュー（ゲーム側の見た目のため固定色） -->
    <div v-else-if="block.kind === 'phone'" class="mx-auto w-56">
      <div class="rounded-[1.4rem] bg-slate-800 p-1.5">
        <div class="flex h-72 flex-col justify-end rounded-[1.1rem] bg-gradient-to-b from-indigo-950 to-slate-900 p-2">
          <div class="rounded-lg bg-white p-2.5 text-slate-900">
            <span class="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">{{ block.data.badge }}</span>
            <p class="mt-1 text-xs font-bold">
              {{ block.data.title }}
            </p>
            <p class="mt-1 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-600">
              {{ block.data.body }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- アップロード -->
    <div v-else-if="block.kind === 'upload'" class="flex flex-col items-center gap-1 rounded-md border border-dashed border-default px-4 py-5 text-center text-xs">
      <UIcon name="i-lucide-upload-cloud" class="size-6 text-muted" />
      <p class="text-muted">
        {{ block.data.text }}
      </p>
      <UBadge v-if="block.data.file" :label="block.data.file" icon="i-lucide-file-check-2" color="success" variant="subtle" size="sm" />
    </div>

    <!-- リスト -->
    <ul v-else-if="block.kind === 'list'" class="divide-y divide-default rounded-md border border-default text-xs">
      <li v-for="(i, idx) in block.data.items" :key="idx" class="flex items-center gap-2 px-3 py-2">
        <span class="min-w-0 flex-1 truncate text-highlighted">{{ i[0] }}</span>
        <span class="truncate text-muted">{{ i[1] }}</span>
        <UBadge v-if="i[2]" :label="i[2]" :color="i[3] ?? 'neutral'" variant="subtle" size="sm" />
      </li>
    </ul>

    <!-- ヒートマップ -->
    <div v-else-if="block.kind === 'heatmap'" class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead class="text-muted">
          <tr>
            <th class="px-2 py-1 text-left font-medium">
              登録日
            </th>
            <th v-for="c in block.data.cols" :key="c" class="px-2 py-1 font-medium">
              {{ c }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, ri) in block.data.rows" :key="r">
            <td class="px-2 py-1 text-highlighted tabular-nums">
              {{ r }}
            </td>
            <td v-for="(v, ci) in block.data.values[ri]" :key="ci" class="px-2 py-1 text-center tabular-nums" :style="{ background: heatColor(v) }">
              {{ v ? `${v}%` : '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
