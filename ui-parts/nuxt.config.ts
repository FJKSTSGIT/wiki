// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  // 部品カタログ（静的に配置できる SPA）
  ssr: false,
  devtools: { enabled: false },

  // STATIC_SHARE=1 のときは任意のパス配下で動くよう相対パス + ハッシュルーティングで出力する
  ...(process.env.STATIC_SHARE && {
    router: { options: { hashMode: true } }
  }),

  app: {
    ...(process.env.STATIC_SHARE && { cdnURL: './', buildAssetsDir: '/assets/' }),
    head: {
      htmlAttrs: { lang: 'ja' },
      title: 'Admin UI Parts',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  },

  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],

  icon: {
    serverBundle: 'local',
    clientBundle: { scan: { globInclude: ['app/**/*.{vue,ts}'] }, sizeLimitKb: 512 },
    fallbackToApi: false
  },

  ui: { fonts: false },

  compatibilityDate: '2026-06-30'
})
