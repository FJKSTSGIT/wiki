<script setup lang="ts">
import { format, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { DailyMetric } from '~/types'

definePageMeta({ permission: 'dashboard.view' })
useHead({ title: 'ダッシュボード' })

const db = useMockDb()
const { can } = usePermission()

const periods = [
  { label: '過去 7 日間', value: 7 },
  { label: '過去 30 日間', value: 30 },
  { label: '過去 90 日間', value: 90 }
]
const period = ref(30)

const current = computed(() => db.value.metrics.slice(-period.value))
const previous = computed(() => db.value.metrics.slice(-period.value * 2, -period.value))

const sum = (rows: DailyMetric[], key: keyof DailyMetric) => rows.reduce((s, r) => s + (r[key] as number), 0)
const avg = (rows: DailyMetric[], key: keyof DailyMetric) => rows.length ? sum(rows, key) / rows.length : 0
const delta = (a: number, b: number) => (b ? (a - b) / b : 0)

const kpis = computed(() => {
  const c = current.value
  const p = previous.value
  const pur = (rows: DailyMetric[]) => sum(rows, 'payingUsers') / Math.max(1, sum(rows, 'dau'))
  const arppu = (rows: DailyMetric[]) => sum(rows, 'revenue') / Math.max(1, sum(rows, 'payingUsers'))
  const spark = (key: keyof DailyMetric) => c.slice(-Math.min(30, c.length)).map(r => r[key] as number)
  return [
    { title: '平均 DAU', icon: 'i-lucide-users', value: formatNumber(Math.round(avg(c, 'dau'))), delta: delta(avg(c, 'dau'), avg(p, 'dau')), trend: spark('dau'), hint: '1 日あたりのアクティブユーザー数の平均' },
    { title: '新規登録数', icon: 'i-lucide-user-plus', value: formatNumber(sum(c, 'newUsers')), delta: delta(sum(c, 'newUsers'), sum(p, 'newUsers')), trend: spark('newUsers') },
    { title: '売上', icon: 'i-lucide-japanese-yen', value: formatYen(sum(c, 'revenue')), delta: delta(sum(c, 'revenue'), sum(p, 'revenue')), trend: spark('revenue'), to: can('purchases.view') ? '/data/purchases' : undefined },
    { title: '課金率 / ARPPU', icon: 'i-lucide-percent', value: `${formatPercent(pur(c), 2)} / ${formatYen(Math.round(arppu(c)))}`, delta: delta(pur(c), pur(p)), hint: '課金率 = 課金ユーザー数 ÷ DAU（延べ）、ARPPU = 売上 ÷ 課金ユーザー数' }
  ]
})

/* ---- 推移グラフ ---- */
const metricTabs = [
  { label: '売上', value: 'revenue', icon: 'i-lucide-japanese-yen' },
  { label: 'DAU', value: 'dau', icon: 'i-lucide-users' },
  { label: '新規登録', value: 'newUsers', icon: 'i-lucide-user-plus' }
]
const metric = ref<'revenue' | 'dau' | 'newUsers'>('revenue')
const chartData = computed(() => current.value.map(r => ({
  date: format(new Date(r.date), period.value > 30 ? 'M/d' : 'M/d(E)', { locale: ja }),
  value: r[metric.value],
  previous: previous.value[current.value.indexOf(r)]?.[metric.value] ?? 0
})))
const chartTotal = computed(() => metric.value === 'dau' ? Math.round(avg(current.value, 'dau')) : sum(current.value, metric.value))
const chartFormat = computed(() => (v: number) => metric.value === 'revenue' ? formatCompactYen(v) : formatCompact(v))

/* ---- プラットフォーム別 ---- */
const platformData = computed(() => [
  { platform: 'iOS', revenue: sum(current.value, 'iosRevenue') },
  { platform: 'Android', revenue: sum(current.value, 'androidRevenue') },
  { platform: 'PC', revenue: sum(current.value, 'pcRevenue') }
])
const platformTotal = computed(() => platformData.value.reduce((s, r) => s + r.revenue, 0))

/* ---- 商品別売上（課金履歴から集計） ---- */
const topProducts = computed(() => {
  const since = subDays(new Date(), period.value).toISOString()
  const map = new Map<string, number>()
  for (const p of db.value.purchases) {
    if (p.status !== 'completed' || p.purchasedAt < since) continue
    map.set(p.productName, (map.get(p.productName) ?? 0) + p.amount)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, amount]) => ({ name, amount }))
})
const topMax = computed(() => topProducts.value[0]?.amount ?? 1)

/* ---- イベント・更新履歴 ---- */
const events = computed(() => db.value.events.slice(0, 6))
const recentLogs = computed(() => db.value.auditLogs.filter(l => l.category !== 'auth').slice(0, 6).map(l => ({
  date: formatRelative(l.createdAt),
  title: `${l.actorName}：${l.action}`,
  description: [l.target, l.detail].filter(Boolean).join(' / '),
  icon: AUDIT_CATEGORY[l.category].icon
})))
</script>

<template>
  <AppPage id="dashboard" title="ダッシュボード">
    <template #toolbar>
      <USelect v-model="period" :items="periods" icon="i-lucide-calendar" class="-ms-1 w-40" variant="ghost" />
      <span class="hidden text-xs text-muted sm:inline">比較：直前の同期間</span>
    </template>
    <template #toolbar-right>
      <UBadge color="success" variant="subtle" icon="i-lucide-activity" label="全サーバー稼働中" />
    </template>

    <!-- KPI -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AppKpiCard v-for="k in kpis" :key="k.title" v-bind="k" />
    </div>

    <!-- 推移 -->
    <UCard :ui="{ body: 'px-2 sm:px-4' }">
      <template #header>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-xs text-muted">
              {{ metricTabs.find(t => t.value === metric)?.label }}{{ metric === 'dau' ? '（平均）' : '（合計）' }}
            </p>
            <p class="text-2xl font-semibold text-highlighted tabular-nums">
              {{ metric === 'revenue' ? formatYen(chartTotal) : formatNumber(chartTotal) }}
            </p>
          </div>
          <UTabs v-model="metric" :items="metricTabs" :content="false" size="sm" color="neutral" variant="pill" />
        </div>
      </template>
      <UChart
        type="area"
        curve="monotone"
        :data="chartData"
        index="date"
        :categories="[{ key: 'value', label: '当期間' }, { key: 'previous', label: '前期間', color: 'var(--ui-border-accented)' }]"
        :format="chartFormat"
        :height="280"
        :initial-width="1000"
        aria-label="KPI の推移"
      />
    </UCard>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-highlighted">
            プラットフォーム別売上
          </h3>
        </template>
        <UChart
          type="donut"
          :data="platformData"
          index="platform"
          :categories="['revenue']"
          :format="formatYen"
          :height="200"
          :initial-width="300"
          :thickness="22"
          aria-label="プラットフォーム別売上"
        >
          <template #center>
            <div class="text-center">
              <p class="text-xs text-muted">
                合計
              </p>
              <p class="text-lg font-semibold text-highlighted tabular-nums">
                {{ formatCompactYen(platformTotal) }}
              </p>
            </div>
          </template>
        </UChart>
      </UCard>

      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              商品別売上 TOP 6
            </h3>
            <UButton v-if="can('purchases.view')" to="/data/purchases" label="課金履歴" trailing-icon="i-lucide-arrow-right" size="xs" variant="link" color="neutral" />
          </div>
        </template>
        <ul class="space-y-3">
          <li v-for="(p, i) in topProducts" :key="p.name" class="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-sm">
            <span class="text-xs font-medium text-dimmed tabular-nums">{{ i + 1 }}</span>
            <div class="min-w-0">
              <p class="mb-1 truncate text-default">
                {{ p.name }}
              </p>
              <UProgress :model-value="(p.amount / topMax) * 100" size="sm" />
            </div>
            <span class="font-medium text-highlighted tabular-nums">{{ formatYen(p.amount) }}</span>
          </li>
          <li v-if="!topProducts.length" class="text-sm text-muted">
            データがありません
          </li>
        </ul>
      </UCard>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              イベント・施策
            </h3>
            <UBadge :label="`開催中 ${db.events.filter(e => e.status === 'running').length}`" color="success" variant="subtle" />
          </div>
        </template>
        <ul class="divide-y divide-default">
          <li v-for="e in events" :key="e.id" class="flex items-center gap-3 px-4 py-3 sm:px-6">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-elevated">
              <UIcon :name="EVENT_TYPE[e.type].icon!" class="size-4 text-muted" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ e.title }}
              </p>
              <p class="text-xs text-muted tabular-nums">
                {{ EVENT_TYPE[e.type].label }} ・ {{ formatDate(e.startAt) }} 〜 {{ formatDate(e.endAt) }}
              </p>
            </div>
            <UBadge :label="EVENT_STATUS[e.status].label" :color="EVENT_STATUS[e.status].color" variant="subtle" />
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              最近の更新履歴
            </h3>
            <UButton v-if="can('auditLogs.view')" to="/audit-logs" label="すべて表示" trailing-icon="i-lucide-arrow-right" size="xs" variant="link" color="neutral" />
          </div>
        </template>
        <UTimeline :items="recentLogs" size="xs" color="neutral" :ui="{ title: 'text-sm', description: 'text-xs truncate', date: 'text-xs' }" />
      </UCard>
    </div>
  </AppPage>
</template>
