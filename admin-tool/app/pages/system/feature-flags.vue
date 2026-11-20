<script setup lang="ts">
const flags = ref(FLAGS.map(f => ({ ...f, envs: { ...f.envs } })))
const { current } = useAppEnv()
const pending = ref<{ flag: (typeof flags.value)[number], env: AppEnv, value: boolean } | null>(null)
function onToggle(flag: (typeof flags.value)[number], env: AppEnv, value: boolean) {
  if (env === 'prod') pending.value = { flag, env, value }
  else flag.envs[env] = value
}
</script>

<template>
  <PageShell id="flags" title="機能フラグ" icon="i-lucide-flag" description="環境ごとの機能 ON/OFF">
    <template #actions>
      <UButton icon="i-lucide-plus" size="sm" label="フラグ追加" />
    </template>
    <div class="rounded-lg border border-default overflow-hidden">
      <div class="grid grid-cols-[1fr_repeat(4,90px)_160px] gap-2 px-4 py-2 text-xs text-muted bg-muted/50 border-b border-default">
        <span>フラグ</span>
        <span v-for="e in ENV_KEYS" :key="e" :data-env="e" class="flex items-center justify-center gap-1.5 font-mono" :class="e === current && 'text-highlighted'" style="--env-c: var(--env)">
          <EnvMascot :env="e" :animated="false" class="size-4" :stroke-width="5" style="color: var(--env)" />{{ ENVS[e].label }}
        </span>
        <span>ロールアウト (prod)</span>
      </div>
      <div v-for="f in flags" :key="f.key" class="grid grid-cols-[1fr_repeat(4,90px)_160px] gap-2 items-center px-4 py-3 border-b border-default last:border-0">
        <div>
          <p class="text-sm text-highlighted">{{ f.name }} <code class="ml-1 text-xs text-muted">{{ f.key }}</code></p>
          <p class="text-xs text-muted">{{ f.desc }}</p>
        </div>
        <div v-for="e in ENV_KEYS" :key="e" class="flex justify-center">
          <USwitch :model-value="f.envs[e]" :color="e === 'prod' ? 'error' : 'primary'" @update:model-value="(v: boolean) => onToggle(f, e, v)" />
        </div>
        <div class="flex items-center gap-2">
          <USlider v-model="f.rollout" :step="5" :disabled="!f.envs.prod" size="sm" class="flex-1" />
          <span class="w-9 text-right text-xs tabular-nums">{{ f.rollout }}%</span>
        </div>
      </div>
    </div>
    <ConfirmDanger
      :open="!!pending"
      :title="pending ? `本番で「${pending.flag.name}」を${pending.value ? '有効' : '無効'}にしますか？` : ''"
      description="本番環境のフラグ変更は即時反映されます。"
      :confirm-word="pending?.flag.key"
      @update:open="v => !v && (pending = null)"
      @confirm="pending && (pending.flag.envs.prod = pending.value)"
    />
  </PageShell>
</template>
