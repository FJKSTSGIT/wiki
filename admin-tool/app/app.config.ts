export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc'
    },
    // タイトルバー(3rem)分を差し引く
    dashboardSidebar: { slots: { root: 'min-h-0' } },
    dashboardPanel: { slots: { root: 'min-h-0' } }
  }
})
