<script setup lang="ts">
/**
 * 確認ダイアログ
 * 直接使わず useConfirm() 経由で呼び出す: `if (await confirm({ title: '...' })) { ... }`
 */
export interface ConfirmDialogProps {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  color?: 'primary' | 'error' | 'warning'
  icon?: string
  /** 危険な操作向け：入力欄にこの文字列を入力するまで実行ボタンを無効化 */
  confirmText?: string
  /** 補足として箇条書き表示する内容（変更差分など） */
  details?: { label: string, value?: string, color?: 'success' | 'error' | 'neutral' }[]
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  confirmLabel: '実行する',
  cancelLabel: 'キャンセル',
  color: 'primary'
})

const emit = defineEmits<{ close: [confirmed: boolean] }>()

const typed = ref('')
const canConfirm = computed(() => !props.confirmText || typed.value === props.confirmText)

const icon = computed(() => props.icon ?? (props.color === 'error' ? 'i-lucide-triangle-alert' : 'i-lucide-circle-help'))
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="true"
    :ui="{ footer: 'justify-end', title: 'flex items-center gap-2' }"
    @update:open="(open: boolean) => !open && emit('close', false)"
  >
    <template #title>
      <UIcon :name="icon" class="size-5 shrink-0" :class="color === 'error' ? 'text-error' : color === 'warning' ? 'text-warning' : 'text-primary'" />
      {{ title }}
    </template>

    <template v-if="details?.length || confirmText" #body>
      <div class="space-y-4">
        <ul v-if="details?.length" class="max-h-64 space-y-1.5 overflow-y-auto rounded-md border border-default bg-elevated/50 p-3 text-sm">
          <li v-for="(d, i) in details" :key="i" class="flex items-center justify-between gap-3">
            <span :class="d.color === 'success' ? 'text-success' : d.color === 'error' ? 'text-error' : 'text-default'">{{ d.label }}</span>
            <span v-if="d.value" class="text-muted">{{ d.value }}</span>
          </li>
        </ul>

        <UFormField v-if="confirmText" :label="`確認のため「${confirmText}」と入力してください`">
          <UInput v-model="typed" :placeholder="confirmText" class="w-full" autofocus />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <UButton :label="cancelLabel" color="neutral" variant="ghost" @click="emit('close', false)" />
      <UButton :label="confirmLabel" :color="color" :disabled="!canConfirm" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
