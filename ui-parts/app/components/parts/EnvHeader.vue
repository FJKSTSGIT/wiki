<script setup lang="ts">
/**
 * 固定ヘッダー（接続先環境の表示付き）
 *
 * - 上端の色ライン + 環境バッジで、どの環境を触っているか常に分かる
 * - 本番環境では注意バナーを出す（閉じても再読み込みで再表示）
 * - スクロールしても上部に固定（sticky）
 */
import { ENVIRONMENTS, ENV_KEYS, type EnvKey } from '~/utils/environments'

const props = withDefaults(defineProps<{
  env: EnvKey
  title?: string
  /** 環境の切替メニューを出す（開発・検証用） */
  switchable?: boolean
  /** 本番の注意バナーを表示する */
  showCaution?: boolean
  /** スマホ用メニューボタンを表示する */
  menuButton?: boolean
}>(), { title: '', switchable: false, showCaution: true, menuButton: true })

const emit = defineEmits<{ 'update:env': [env: EnvKey], 'menu': [] }>()

defineSlots<{
  left?(): any
  right?(): any
}>()

const meta = computed(() => ENVIRONMENTS[props.env])
const cautionClosed = ref(false)
watch(() => props.env, () => { cautionClosed.value = false })

const envItems = computed(() => [ENV_KEYS.map(k => ({
  label: ENVIRONMENTS[k].label,
  icon: ENVIRONMENTS[k].icon,
  type: 'checkbox' as const,
  checked: k === props.env,
  onSelect: () => emit('update:env', k)
}))])
</script>

<template>
  <header class="sticky top-0 z-30">
    <div class="h-1 w-full" :class="meta.stripe" />
    <div class="border-b border-default bg-default/90 backdrop-blur">
    <div class="flex h-14 items-center gap-3 px-4 sm:px-6" :class="meta.tint">
      <UButton
        v-if="menuButton"
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        square
        class="lg:hidden"
        aria-label="メニューを開く"
        @click="emit('menu')"
      />
      <slot name="left">
        <h1 v-if="title" class="truncate font-semibold text-highlighted">
          {{ title }}
        </h1>
      </slot>

      <UDropdownMenu v-if="switchable" :items="envItems" :content="{ align: 'start' }">
        <UButton :icon="meta.icon" :label="meta.label" :color="meta.color" variant="subtle" size="sm" trailing-icon="i-lucide-chevron-down" class="shrink-0" />
      </UDropdownMenu>
      <UTooltip v-else :text="meta.description">
        <UBadge :icon="meta.icon" :label="meta.label" :color="meta.color" variant="subtle" class="shrink-0" />
      </UTooltip>

      <div class="ms-auto flex items-center gap-2">
        <slot name="right" />
      </div>
    </div>
    </div>

    <div
      v-if="showCaution && meta.caution && !cautionClosed"
      class="flex items-center gap-2 border-b border-error/30 bg-error/10 px-4 py-1.5 text-xs text-error sm:px-6"
      role="status"
    >
      <UIcon name="i-lucide-triangle-alert" class="size-4 shrink-0" />
      <span class="min-w-0 flex-1">{{ meta.description }}</span>
      <UButton icon="i-lucide-x" size="xs" color="error" variant="link" aria-label="注意表示を閉じる" @click="cautionClosed = true" />
    </div>
  </header>
</template>
