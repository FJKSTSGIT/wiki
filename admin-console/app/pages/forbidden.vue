<script setup lang="ts">
useHead({ title: 'アクセス権限がありません' })
const route = useRoute()
const { can } = usePermission()
const required = computed(() => route.query.required as PermissionKey | undefined)
const home = computed(() => firstAccessiblePath(can))
</script>

<template>
  <AppPage id="forbidden" title="アクセス権限がありません">
    <div class="flex flex-1 items-center justify-center">
      <UEmpty
        icon="i-lucide-shield-x"
        title="この画面を表示する権限がありません"
        :description="required ? `必要な権限：${permissionLabel(required)}（${required}）。管理者に権限の付与を依頼してください。` : '管理者に権限の付与を依頼してください。'"
        :actions="home ? [{ label: 'アクセス可能な画面へ', to: home, icon: 'i-lucide-arrow-right' }] : []"
        size="lg"
      />
    </div>
  </AppPage>
</template>
