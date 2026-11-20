<script setup lang="ts">
const { info, current } = useAppEnv()
const lowStock = PRODUCTS.filter(p => p.stock <= p.threshold).slice(0, 5)
const recentOrders = ORDERS.slice(0, 6)
const recentLogs = AUDIT_LOGS.slice(0, 6)
const deploys = [
  { ver: 'v2.18.0', env: 'prod', at: '11/19 18:02', by: '高橋 大輔', note: '新レコメンド 50% ロールアウト' },
  { ver: 'v2.18.0', env: 'stg', at: '11/18 15:40', by: '高橋 大輔', note: 'QA 通過' },
  { ver: 'v2.18.0-rc.2', env: 'dev', at: '11/17 11:12', by: '伊藤 陽菜', note: '検索インデックス修正' },
  { ver: 'v2.17.3', env: 'prod', at: '11/12 10:00', by: '佐藤 美咲', note: 'ホットフィックス' }
] as const
</script>

<template>
  <PageShell id="dashboard" title="ダッシュボード" icon="i-lucide-layout-dashboard" description="運用状況のサマリー">
    <template #actions>
      <USelect :model-value="'14d'" :items="[{ label: '直近14日', value: '14d' }, { label: '直近30日', value: '30d' }]" class="w-32" size="sm" />
      <UButton icon="i-lucide-download" color="neutral" variant="outline" size="sm" label="エクスポート" />
    </template>

    <div class="space-y-6">
      <!-- 環境のご挨拶 -->
      <div class="relative overflow-hidden rounded-lg border border-default bg-muted/40 px-5 py-4 flex items-center gap-4" style="border-left: 2px solid var(--env)">
        <div class="min-w-0">
          <p class="text-xs font-mono tracking-widest" style="color: var(--env)">{{ info.label }} · {{ info.creatureEn.toUpperCase() }}</p>
          <p class="text-highlighted font-medium">おかえりなさい、山田さん。いまは<span style="color: var(--env)">「{{ info.name }}」</span>環境です。</p>
          <p class="text-sm text-muted">{{ info.tagline }}</p>
        </div>
        <EnvMascot :env="current" class="ml-auto size-16 shrink-0 opacity-60" style="color: var(--env)" :stroke-width="2" />
      </div>

      <div class="grid grid-cols-4 gap-4">
        <StatTile label="本日の売上" value="¥1,284,600" :delta="12.4" icon="i-lucide-banknote" hint="前日比" />
        <StatTile label="注文数" value="312" :delta="8.1" icon="i-lucide-shopping-cart" hint="前日比" />
        <StatTile label="アクティブユーザー" value="4,821" :delta="-2.3" icon="i-lucide-users" hint="前週比" />
        <StatTile label="未処理の返金" value="7" icon="i-lucide-undo-2" hint="うち 2 件が 48h 超過" />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <UCard class="col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-highlighted">注文数の推移</p>
                <p class="text-xs text-muted">直近14日 / 日別</p>
              </div>
              <UButton to="/orders" variant="link" color="neutral" size="xs" trailing-icon="i-lucide-arrow-right" label="注文一覧" />
            </div>
          </template>
          <OrdersBarChart :data="DAILY_ORDERS" />
        </UCard>

        <UCard>
          <template #header>
            <p class="font-medium text-highlighted">システム状態</p>
          </template>
          <ul class="space-y-3 text-sm">
            <li v-for="s in [
              { name: 'API', st: 'ok', v: '99.98%' },
              { name: 'DB (primary)', st: 'ok', v: 'p95 12ms' },
              { name: '検索', st: 'warn', v: '再構築中' },
              { name: 'バッチ', st: 'err', v: '1 件失敗' },
              { name: 'メール配信', st: 'ok', v: 'キュー 0' }
            ]" :key="s.name" class="flex items-center gap-2">
              <UIcon
                :name="s.st === 'ok' ? 'i-lucide-circle-check' : s.st === 'warn' ? 'i-lucide-circle-alert' : 'i-lucide-circle-x'"
                :class="s.st === 'ok' ? 'text-success' : s.st === 'warn' ? 'text-warning' : 'text-error'" class="size-4"
              />
              <span class="text-default">{{ s.name }}</span>
              <span class="ml-auto text-muted font-mono text-xs">{{ s.v }}</span>
            </li>
          </ul>
        </UCard>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <p class="font-medium text-highlighted">最近の注文</p>
              <UButton to="/orders" variant="link" color="neutral" size="xs" label="すべて" />
            </div>
          </template>
          <ul class="divide-y divide-default">
            <li v-for="o in recentOrders" :key="o.id" class="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span class="font-mono text-xs text-muted">{{ o.id }}</span>
              <span class="truncate">{{ o.customer }}</span>
              <UBadge :color="ORDER_STATUS[o.status].color" variant="subtle" size="sm" class="ml-auto">{{ ORDER_STATUS[o.status].label }}</UBadge>
              <span class="w-20 text-right tabular-nums">{{ yen(o.total) }}</span>
            </li>
          </ul>
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <p class="font-medium text-highlighted">在庫アラート</p>
              <UButton to="/catalog/inventory" variant="link" color="neutral" size="xs" label="在庫へ" />
            </div>
          </template>
          <ul class="divide-y divide-default">
            <li v-for="p in lowStock" :key="p.id" class="px-4 py-2.5 text-sm">
              <div class="flex items-center gap-2">
                <span class="truncate">{{ p.name }}</span>
                <span class="ml-auto tabular-nums" :class="p.stock === 0 ? 'text-error' : 'text-warning'">{{ p.stock }} / {{ p.threshold }}</span>
              </div>
              <UProgress :model-value="Math.min(100, (p.stock / p.threshold) * 100)" size="xs" :color="p.stock === 0 ? 'error' : 'warning'" class="mt-1.5" />
            </li>
          </ul>
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <p class="font-medium text-highlighted">デプロイ履歴</p>
          </template>
          <ul class="divide-y divide-default">
            <li v-for="d in deploys" :key="d.ver + d.env" class="flex items-center gap-3 px-4 py-2.5 text-sm" :data-env="d.env">
              <span class="grid place-items-center size-7 rounded border" style="border-color: var(--env); color: var(--env)">
                <EnvMascot :env="d.env" :animated="false" class="size-5" :stroke-width="5" />
              </span>
              <div class="min-w-0">
                <p class="font-mono text-xs text-highlighted">{{ d.ver }} <span style="color: var(--env)">→ {{ d.env }}</span></p>
                <p class="text-xs text-muted truncate">{{ d.note }} · {{ d.by }}</p>
              </div>
              <span class="ml-auto text-xs text-dimmed">{{ d.at }}</span>
            </li>
          </ul>
        </UCard>
      </div>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-medium text-highlighted">最近の操作</p>
            <UButton to="/system/audit-logs" variant="link" color="neutral" size="xs" label="監査ログ" />
          </div>
        </template>
        <ul class="divide-y divide-default">
          <li v-for="l in recentLogs" :key="l.id" class="flex items-center gap-3 px-4 py-2 text-sm">
            <span class="text-xs text-dimmed w-32">{{ fmtDate(l.at) }}</span>
            <span class="w-28 truncate">{{ l.actor }}</span>
            <code class="text-xs font-mono text-primary">{{ l.action }}</code>
            <span class="text-xs text-muted font-mono">{{ l.target }}</span>
          </li>
        </ul>
      </UCard>
    </div>
  </PageShell>
</template>
