<script setup lang="ts">
const selected = ref<string>('operator')
const matrix = reactive(Object.fromEntries(Object.entries(ROLE_MATRIX).map(([k, v]) => [k, new Set(v)])))
const toggle = (p: string) => { const s = matrix[selected.value]!; if (s.has(p)) s.delete(p); else s.add(p) }
const role = computed(() => ROLES.find(r => r.id === selected.value)!)
</script>

<template>
  <PageShell id="roles" title="ロール・権限" icon="i-lucide-shield-check" description="ロールごとの権限を管理">
    <template #actions>
      <UButton icon="i-lucide-plus" size="sm" label="ロール作成" />
    </template>
    <div class="grid grid-cols-[300px_1fr] gap-6">
      <div class="space-y-2">
        <button
          v-for="r in ROLES" :key="r.id"
          class="w-full text-left rounded-lg border px-4 py-3 transition"
          :class="selected === r.id ? 'border-primary bg-primary/5' : 'border-default hover:bg-elevated/50'"
          @click="selected = r.id"
        >
          <div class="flex items-center gap-2">
            <UBadge :color="r.color" variant="subtle" size="sm">{{ r.name }}</UBadge>
            <span class="ml-auto text-xs text-muted">{{ r.users }} 人</span>
          </div>
          <p class="text-xs text-muted mt-1.5">{{ r.desc }}</p>
        </button>
      </div>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-highlighted">{{ role.name }} の権限</p>
              <p class="text-xs text-muted">{{ matrix[selected]!.size }} / {{ PERMISSIONS.flatMap(p => p.items).length }} 権限</p>
            </div>
            <UButton size="sm" label="変更を保存" />
          </div>
        </template>
        <div class="grid grid-cols-2 gap-6">
          <div v-for="g in PERMISSIONS" :key="g.group">
            <p class="text-xs font-semibold tracking-wider text-dimmed mb-2">{{ g.group }}</p>
            <div class="space-y-2">
              <div v-for="p in g.items" :key="p" class="flex items-center justify-between rounded-md border border-default px-3 py-2">
                <code class="text-xs font-mono">{{ p }}</code>
                <USwitch :model-value="matrix[selected]!.has(p)" :disabled="selected === 'owner'" size="sm" @update:model-value="toggle(p)" />
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </PageShell>
</template>
