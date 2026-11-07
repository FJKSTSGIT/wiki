// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  // 社内管理ツールのモックのため SPA として動作させる（モックデータはブラウザ内で生成・保持）
  ssr: false,

  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      title: 'Game Admin Console',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  },

  // components/ 配下のディレクトリ名をコンポーネント名に含めない（AppDataTable, PermissionMatrix …）
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],

  icon: {
    // アイコンはローカルにバンドルし、外部 API（Iconify）には問い合わせない
    serverBundle: 'local',
    clientBundle: {
      // utils/*.ts 等で文字列として定義したアイコンも含める
      scan: { globInclude: ['app/**/*.{vue,ts}'] },
      sizeLimitKb: 512
    },
    fallbackToApi: false
  },

  ui: {
    // 外部フォント取得を行わず、OS 標準の日本語フォントを使う
    fonts: false
  },

  compatibilityDate: '2026-06-30'
})
