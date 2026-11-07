<script setup lang="ts">
useHead({ title: 'ヘルプ' })
const shortcuts = [
  { keys: ['meta', 'k'], label: '画面を検索' },
  { keys: ['g', 'd'], label: 'ダッシュボードへ' },
  { keys: ['g', 'u'], label: 'ユーザー管理へ' },
  { keys: ['g', 'p'], label: '権限管理へ' }
]
</script>

<template>
  <AppPage id="help" title="ヘルプ" narrow>
    <UAlert
      icon="i-lucide-flask-conical"
      color="info"
      variant="subtle"
      title="これはモック画面です"
      description="データはブラウザ内で生成した仮データです。変更はリロードで元に戻ります。ユーザーメニューの「ログインユーザー切替（モック）」で権限ごとの表示を確認できます。"
    />
    <UCard>
      <template #header>
        <h3 class="font-semibold text-highlighted">
          キーボードショートカット
        </h3>
      </template>
      <ul class="divide-y divide-default text-sm">
        <li v-for="s in shortcuts" :key="s.label" class="flex items-center justify-between py-2.5">
          <span>{{ s.label }}</span>
          <span class="flex gap-1"><UKbd v-for="k in s.keys" :key="k" :value="k" /></span>
        </li>
      </ul>
    </UCard>
  </AppPage>
</template>
