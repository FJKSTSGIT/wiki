// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  ssr: false,
  colorMode: { preference: 'dark' },
  app: {
    head: { title: 'Hatchery Admin', htmlAttrs: { lang: 'ja' } }
  },
  runtimeConfig: {
    public: {
      // local | dev | stg | prod  (NUXT_PUBLIC_APP_ENV で上書き)
      appEnv: 'local'
    }
  },
  ui: { fonts: false },
  icon: {
    provider: 'server',
    serverBundle: { collections: ['lucide'] },
    clientBundle: { scan: { globInclude: ['app/**/*.{vue,ts}'] }, sizeLimitKb: 512 }
  }
})
