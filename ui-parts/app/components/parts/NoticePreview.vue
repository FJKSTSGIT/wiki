<script setup lang="ts">
/** お知らせのゲーム内表示プレビュー（スマホ画面イメージ） */
import { format } from 'date-fns'
import { NOTICE_CATEGORIES, type NoticeDraft } from '~/utils/notice'

const props = defineProps<{ notice: NoticeDraft }>()

const category = computed(() => NOTICE_CATEGORIES[props.notice.category])
const period = computed(() => {
  const f = (v: string) => (v ? format(new Date(v), 'M/d HH:mm') : '—')
  return `${f(props.notice.startAt)} 〜 ${f(props.notice.endAt)}`
})
</script>

<template>
  <div class="mx-auto w-full max-w-72">
    <!-- 端末の枠 -->
    <div class="rounded-[2rem] border-4 border-inverted/80 bg-inverted/80 p-1.5 shadow-lg">
      <div class="relative flex h-[28rem] flex-col overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-indigo-950 to-slate-900 text-white">
        <!-- プッシュ通知 -->
        <div v-if="notice.push && notice.pushText" class="absolute inset-x-2 top-2 z-10 flex gap-2 rounded-xl bg-white/90 p-2.5 text-slate-900 shadow">
          <div class="flex size-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
            <UIcon name="i-lucide-swords" class="size-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[10px] text-slate-500">
              プッシュ通知
            </p>
            <p class="line-clamp-2 text-xs">
              {{ notice.pushText }}
            </p>
          </div>
        </div>

        <div class="flex-1" />

        <!-- お知らせ本体 -->
        <div
          class="m-3 flex max-h-[80%] flex-col rounded-xl bg-white text-slate-900 shadow-xl"
          :class="notice.display === 'popup' ? 'ring-4 ring-amber-300/70' : ''"
        >
          <div class="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <span class="text-xs font-bold text-slate-500">{{ notice.display === 'popup' ? '重要なお知らせ' : 'お知らせ' }}</span>
            <UIcon name="i-lucide-x" class="size-4 text-slate-400" />
          </div>
          <div class="min-h-0 overflow-y-auto px-3 py-2.5">
            <div class="mb-1.5 flex flex-wrap items-center gap-1.5">
              <UBadge :label="category.label" :color="category.color" size="sm" />
              <UBadge v-if="notice.display === 'pinned'" label="固定" color="neutral" variant="outline" size="sm" />
            </div>
            <p class="text-sm font-bold leading-snug">
              {{ notice.title || 'タイトル未入力' }}
            </p>
            <p class="mt-0.5 text-[10px] text-slate-500 tabular-nums">
              掲載期間 {{ period }}
            </p>
            <p class="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
              {{ notice.body || '本文がここに表示されます。' }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <p class="mt-2 text-center text-xs text-muted">
      ゲーム内表示イメージ（{{ notice.platforms.join(' / ') || '対象端末なし' }}）
    </p>
  </div>
</template>
