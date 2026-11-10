<script setup lang="ts">
const collapsed = ref(false)
const menuOpen = ref(false)
const { env } = useEnvironment()
const route = useRoute()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const pageTitle = computed(() =>
  CATALOG_MENU.flatMap(g => g.items).find(i => i.to === route.path)?.label ?? 'Admin UI Parts')
</script>

<template>
  <div class="flex min-h-dvh bg-default">
    <SideMenu v-model:collapsed="collapsed" v-model:open="menuOpen" :groups="CATALOG_MENU">
      <template #header="{ collapsed: c }">
        <NuxtLink to="/" class="flex min-w-0 items-center gap-2">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-inverted">
            <UIcon name="i-lucide-blocks" class="size-4" />
          </span>
          <span v-if="!c" class="truncate text-sm font-semibold text-highlighted">Admin UI Parts</span>
        </NuxtLink>
      </template>
    </SideMenu>

    <div class="flex min-w-0 flex-1 flex-col">
      <EnvHeader v-model:env="env" :title="pageTitle" switchable @menu="menuOpen = true">
        <template #right>
          <RoleSwitcher size="sm" class="hidden sm:block" />
          <UButton
            :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
            color="neutral"
            variant="ghost"
            square
            :aria-label="isDark ? 'ライトモードにする' : 'ダークモードにする'"
            @click="colorMode.preference = isDark ? 'light' : 'dark'"
          />
        </template>
      </EnvHeader>

      <main class="flex-1 px-4 py-6 sm:px-6">
        <div class="mb-4 sm:hidden">
          <RoleSwitcher size="sm" />
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>
