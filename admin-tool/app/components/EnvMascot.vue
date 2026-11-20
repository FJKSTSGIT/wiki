<script setup lang="ts">
import type { AppEnv } from '~/composables/useAppEnv'

const props = withDefaults(defineProps<{ env: AppEnv, strokeWidth?: number, animated?: boolean }>(), {
  strokeWidth: 2.5,
  animated: true
})

const anim = computed(() => {
  if (!props.animated) return ''
  return { local: 'mascot-float', dev: 'mascot-wobble', stg: 'mascot-bob', prod: 'mascot-bob' }[props.env]
})
</script>

<template>
  <svg
    viewBox="0 0 120 120"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <g :class="anim">
      <!-- 墓 -->
      <template v-if="env === 'local'">
        <path d="M34 104V52a26 26 0 0 1 52 0v52" />
        <path d="M60 50v28M49 61h22" />
        <path d="M76 84l-5 6 4 5" opacity=".6" />
        <path d="M92 34c4-6 10-6 12 0-4 2-4 8 0 10-6 3-12-2-12-10z" opacity=".5" />
        <circle cx="97" cy="35" r=".8" fill="currentColor" opacity=".5" />
      </template>
      <!-- 卵 -->
      <template v-else-if="env === 'dev'">
        <path d="M60 16C39 16 26 50 26 71c0 20 15 35 34 35s34-15 34-35c0-21-13-55-34-55z" />
        <path d="M37 64l9 6 7-9 8 10 8-8 8 8 7-6" />
        <path d="M44 38c-5 7-7 13-7 19" opacity=".5" />
      </template>
      <!-- 雛 -->
      <template v-else-if="env === 'stg'">
        <path d="M40 56c-10-10-6-30 12-30 14 0 20 12 18 24 16 2 26 14 22 30-4 16-18 22-32 22-16 0-30-10-30-24 0-10 4-16 10-22z" />
        <path d="M52 26c-2-6 2-10 6-8M52 26c4-6 10-4 10-2" />
        <circle cx="50" cy="40" r="2.6" fill="currentColor" stroke="none" />
        <path d="M34 40l-10 5 11 3" />
        <path d="M58 72c8 8 20 8 26-2" />
        <path d="M54 102v8m-4 0h8M68 102v8m-4 0h8" />
      </template>
      <!-- 鶏 -->
      <template v-else>
        <path d="M38 50c-6-10-4-24 8-26 12-2 18 8 16 20 2 12 10 16 22 12 4-12 8-22 18-26 2 16 0 32-6 42-6 18-20 26-36 26s-28-12-28-26c0-10 2-16 6-22z" />
        <path d="M42 24c-2-8 4-10 6-4 0-8 8-8 8 0 2-6 8-4 6 4" />
        <path d="M35 38l-9 4 9 3" />
        <path d="M36 46c-4 6 2 10 4 4" />
        <circle cx="46" cy="34" r="2.6" fill="currentColor" stroke="none" />
        <path d="M96 32c4-10 12-10 14-6M100 44c6-6 12-4 12 0" />
        <path d="M50 70c8 12 24 12 32 0M56 76c6 6 14 6 20 0" opacity=".7" />
        <path d="M54 98v12m-6 0h12M70 98v12m-6 0h12" />
      </template>
    </g>
  </svg>
</template>
