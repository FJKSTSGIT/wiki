<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v: boolean) => { colorMode.preference = v ? 'dark' : 'light' }
})
</script>

<template>
  <div class="flex items-center gap-1">
    <UTooltip :text="isDark ? 'ライトモード' : 'ダークモード'">
      <UButton
        :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
        color="neutral"
        variant="ghost"
        square
        aria-label="テーマ切替"
        @click="isDark = !isDark"
      />
    </UTooltip>
  </div>
</template>
