<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()

const environments = [
  { label: '本番環境', value: 'production', color: 'error' as const },
  { label: 'ステージング', value: 'staging', color: 'warning' as const },
  { label: '開発環境', value: 'development', color: 'info' as const }
]
// モック：接続先環境の切替 UI（実際の接続は行わない）
const env = useState('env', () => 'production')
const current = computed(() => environments.find(e => e.value === env.value)!)
const items = computed(() => [environments.map(e => ({
  label: e.label,
  type: 'checkbox' as const,
  checked: e.value === env.value,
  onSelect: () => { env.value = e.value }
}))])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'start', collisionPadding: 12 }" :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
    >
      <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-inverted">
        <UIcon name="i-lucide-swords" class="size-4" />
      </span>
      <span v-if="!collapsed" class="flex min-w-0 flex-col items-start text-left leading-tight">
        <span class="truncate text-sm font-semibold text-highlighted">Game Admin</span>
        <span class="flex items-center gap-1 text-xs text-muted">
          <span class="size-1.5 rounded-full" :class="{ 'bg-error': current.color === 'error', 'bg-warning': current.color === 'warning', 'bg-info': current.color === 'info' }" />
          {{ current.label }}
        </span>
      </span>
    </UButton>
  </UDropdownMenu>
</template>
