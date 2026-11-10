<script setup lang="ts">
useHead({ title: 'はじめに' })

const parts = [
  { title: 'パターン一覧（選択）', to: '/patterns', icon: 'i-lucide-list-checks', description: 'ゲーム管理ツールでよく使う画面・機能を一覧から選んで、構成を決める' },
  { title: 'サイドメニュー', to: '/parts/side-menu', icon: 'i-lucide-panel-left', description: '折りたたみ・スマホ対応・権限による項目の出し分け' },
  { title: '固定ヘッダー（環境表示）', to: '/parts/env-header', icon: 'i-lucide-panel-top', description: '本番・ステージングなど接続先を色で常に表示' },
  { title: '権限による表示切替', to: '/parts/access', icon: 'i-lucide-shield-check', description: '非表示・操作不可・伏せ字の 3 通りで出し分け' },
  { title: 'お知らせ設定', to: '/parts/notice', icon: 'i-lucide-megaphone', description: 'ゲーム内お知らせの作成・掲載期間・プッシュ通知とプレビュー' }
]
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <div>
      <h2 class="text-2xl font-semibold text-highlighted text-balance">
        ゲーム管理ツール UI 部品カタログ
      </h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">
        Nuxt UI の標準部品を組み合わせて作った、管理ツール用の部品集です。各ページで実際に動かしながら、見た目と使い方を確認できます。
        このカタログ自体も、ここにある「サイドメニュー」と「固定ヘッダー」で作られています。
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UPageCard
        v-for="p in parts"
        :key="p.to"
        :to="p.to"
        :title="p.title"
        :description="p.description"
        :icon="p.icon"
        variant="outline"
        :ui="{ leading: 'p-2 rounded-md bg-primary/10', leadingIcon: 'text-primary' }"
      />
    </div>

    <UCard>
      <template #header>
        <h3 class="font-semibold text-highlighted">
          試し方
        </h3>
      </template>
      <ul class="space-y-2 text-sm">
        <li class="flex gap-2">
          <UIcon name="i-lucide-user-round-cog" class="mt-0.5 size-4 shrink-0 text-primary" />
          <span>画面上部の<b>役割の切替</b>で「閲覧のみ」などに変えると、左メニューの「権限で出し分けるメニュー（例）」の項目やボタンが変わります。</span>
        </li>
        <li class="flex gap-2">
          <UIcon name="i-lucide-flame" class="mt-0.5 size-4 shrink-0 text-error" />
          <span>上部の<b>環境バッジ</b>から接続先を切り替えると、ヘッダーの色と注意表示が変わります。</span>
        </li>
        <li class="flex gap-2">
          <UIcon name="i-lucide-smartphone" class="mt-0.5 size-4 shrink-0 text-primary" />
          <span>スマホでは左上の <b>☰</b> からメニューを開きます。</span>
        </li>
      </ul>
    </UCard>
  </div>
</template>
