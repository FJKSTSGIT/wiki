<script setup lang="ts">
// 破壊的操作の確認。prod では確認ワード入力を必須にする
const props = defineProps<{ title: string, description?: string, confirmWord?: string }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()
const { info, current } = useAppEnv()
const typed = ref('')
watch(open, () => { typed.value = '' })
const ok = computed(() => !props.confirmWord || typed.value === props.confirmWord)
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #body>
      <div class="space-y-4">
        <div class="flex items-center gap-3 rounded-md border px-3 py-2 text-sm" style="border-color: var(--env); background: var(--env-faint)">
          <EnvMascot :env="current" class="size-7 shrink-0" style="color: var(--env)" :stroke-width="4" />
          <span>この操作は <b style="color: var(--env)">{{ info.label }}（{{ info.name }}）</b> 環境に適用されます。</span>
        </div>
        <UFormField v-if="confirmWord" :label="`確認のため「${confirmWord}」と入力してください`">
          <UInput v-model="typed" class="w-full" :placeholder="confirmWord" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" label="キャンセル" @click="open = false" />
        <UButton color="error" label="実行する" :disabled="!ok" @click="emit('confirm'); open = false" />
      </div>
    </template>
  </UModal>
</template>
