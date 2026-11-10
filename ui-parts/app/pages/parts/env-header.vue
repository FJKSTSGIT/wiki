<script setup lang="ts">
import { ENVIRONMENTS, ENV_KEYS, type EnvKey } from '~/utils/environments'

useHead({ title: '固定ヘッダー（環境表示）' })

const env = ref<EnvKey>('production')
const switchable = ref(false)
const showCaution = ref(true)

const code = `<EnvHeader
  :env="env"                 // 'production' | 'staging' | 'development' | 'local'
  title="お知らせ設定"
  :switchable="isDev"        // 開発中だけ環境の切替メニューを出す
  @update:env="v => env = v"
  @menu="menuOpen = true"    // スマホのメニューボタン
>
  <template #right>
    <UserMenu />
  </template>
</EnvHeader>

// 環境ごとの色・文言は utils/environments.ts で一元管理
// 本番では runtimeConfig（ビルド時の環境変数）から env を決めるのがおすすめ`

const propsTable = [
  { name: 'env', type: 'EnvKey', description: '接続先環境。色・ラベル・注意文が切り替わる' },
  { name: 'title', type: 'string', default: "''", description: '画面タイトル（left スロットで置き換え可）' },
  { name: 'switchable', type: 'boolean', default: 'false', description: '環境の切替メニューを表示（update:env を発火）' },
  { name: 'showCaution', type: 'boolean', default: 'true', description: '本番環境で注意バナーを出す' },
  { name: 'menuButton', type: 'boolean', default: 'true', description: 'スマホ用のメニューボタンを出す（menu を発火）' },
  { name: '#left / #right', type: 'slot', description: 'タイトル部分・右側（ユーザーメニューなど）の差し替え' }
]
</script>

<template>
  <PartDoc
    title="固定ヘッダー（環境表示）"
    file="components/parts/EnvHeader.vue"
    summary="画面上部に固定するヘッダーです。どの環境（本番・ステージングなど）を操作しているかを、色のラインとバッジで常に表示します。本番では注意文も出します。"
    :points="['上端の色ラインで、スクロール中でも環境が分かる', '本番は赤・ステージングは黄など、色は 1 か所で管理', '本番接続中は注意バナー（閉じても再読み込みで再表示）', 'スクロールしても上部に固定される']"
    :code="code"
    :props="propsTable"
  >
    <template #controls>
      <URadioGroup v-model="env" :items="ENV_KEYS.map(k => ({ label: ENVIRONMENTS[k].label, value: k }))" orientation="horizontal" size="sm" />
      <USwitch v-model="switchable" label="切替メニュー" size="sm" />
      <USwitch v-model="showCaution" label="本番の注意表示" size="sm" />
    </template>

    <template #demo>
      <div class="h-80 overflow-y-auto bg-default">
        <EnvHeader v-model:env="env" title="お知らせ設定" :switchable="switchable" :show-caution="showCaution" :menu-button="false">
          <template #right>
            <UAvatar alt="管理 太郎" size="sm" />
          </template>
        </EnvHeader>
        <div class="space-y-3 p-6">
          <p class="text-sm text-muted">
            この枠をスクロールしても、ヘッダーは上に固定されたままです。
          </p>
          <div v-for="i in 8" :key="i" class="h-10 rounded-md bg-elevated/60" />
        </div>
      </div>
    </template>

    <template #extra>
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-highlighted">
          環境ごとの表示
        </h3>
        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="k in ENV_KEYS" :key="k" class="overflow-hidden rounded-lg border border-default">
            <EnvHeader :env="k" :title="ENVIRONMENTS[k].label" :menu-button="false" :show-caution="false" />
            <p class="px-4 py-2 text-xs text-muted">
              {{ ENVIRONMENTS[k].description }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </PartDoc>
</template>
