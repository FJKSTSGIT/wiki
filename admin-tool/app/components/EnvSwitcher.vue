<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()
const { base, preview, current, info } = useAppEnv()

const items = computed(() => [[
  { label: `実環境: ${ENVS[base].label}`, type: 'label' as const }
], ENV_KEYS.map(k => ({
  label: `${ENVS[k].label}  ${ENVS[k].name}`,
  suffix: ENVS[k].creature,
  type: 'checkbox' as const,
  checked: current.value === k,
  onUpdateChecked: () => { preview.value = k === base ? null : k }
}))])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ side: 'top', align: 'start' }" :ui="{ content: 'w-56' }">
    <button
      class="group w-full flex items-center gap-3 rounded-md border px-2 py-2 text-left transition hover:bg-elevated/60"
      style="border-color: var(--env-soft)"
    >
      <span class="grid place-items-center size-8 shrink-0 rounded-md" style="color: var(--env); background: var(--env-faint)">
        <EnvMascot :env="current" class="size-6" :stroke-width="4" />
      </span>
      <span v-if="!collapsed" class="min-w-0 flex-1">
        <span class="block text-xs font-mono tracking-widest" style="color: var(--env)">{{ info.label }} · {{ info.creatureEn }}</span>
        <span class="block text-xs text-muted truncate">{{ info.tagline }}</span>
      </span>
      <UIcon v-if="!collapsed" name="i-lucide-chevrons-up-down" class="size-4 text-dimmed" />
    </button>
  </UDropdownMenu>
</template>
