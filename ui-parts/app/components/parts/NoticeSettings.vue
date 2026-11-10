<script setup lang="ts">
/**
 * お知らせ設定フォーム（ゲーム内お知らせの作成・配信設定）
 *
 * - 入力内容は v-model で親と共有（下書きの保存・API 送信は親が行う）
 * - 右側にゲーム内の表示イメージをリアルタイムで表示
 * - 「公開予約」は notice.publish 権限が無いと押せない（下書き保存は notice.edit）
 * - 期間・文字数などは zod で検証
 */
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  NOTICE_CATEGORIES,
  NOTICE_DISPLAYS,
  NOTICE_PLATFORMS,
  NOTICE_TARGETS,
  type NoticeCategory,
  type NoticeDraft
} from '~/utils/notice'

const props = withDefaults(defineProps<{
  /** プレビューを表示する */
  preview?: boolean
}>(), { preview: true })

const emit = defineEmits<{
  saveDraft: [notice: NoticeDraft]
  schedule: [notice: NoticeDraft]
}>()

const model = defineModel<NoticeDraft>({ required: true })

const TITLE_MAX = 40
const BODY_MAX = 1000
const PUSH_MAX = 60

const schema = z.object({
  category: z.string(),
  title: z.string().trim().min(1, 'タイトルを入力してください').max(TITLE_MAX, `${TITLE_MAX} 文字以内で入力してください`),
  body: z.string().trim().min(1, '本文を入力してください').max(BODY_MAX, `${BODY_MAX} 文字以内で入力してください`),
  startAt: z.string().min(1, '開始日時を入力してください'),
  endAt: z.string().min(1, '終了日時を入力してください'),
  platforms: z.array(z.string()).min(1, '対象の端末を 1 つ以上選んでください'),
  target: z.string(),
  display: z.string(),
  push: z.boolean(),
  pushText: z.string()
}).refine(v => !v.startAt || !v.endAt || v.endAt > v.startAt, { path: ['endAt'], message: '終了日時は開始日時より後にしてください' })
  .refine(v => !v.push || v.pushText.trim().length > 0, { path: ['pushText'], message: 'プッシュ通知の文言を入力してください' })
  .refine(v => v.pushText.length <= PUSH_MAX, { path: ['pushText'], message: `${PUSH_MAX} 文字以内で入力してください` })

const { can } = useAccess()
const toast = useToast()
const form = useTemplateRef('form')
const action = ref<'draft' | 'schedule'>('schedule')

const categoryItems = (Object.keys(NOTICE_CATEGORIES) as NoticeCategory[]).map(k => ({
  label: NOTICE_CATEGORIES[k].label,
  value: k,
  icon: NOTICE_CATEGORIES[k].icon
}))

const durationText = computed(() => {
  const s = new Date(model.value.startAt).getTime()
  const e = new Date(model.value.endAt).getTime()
  if (!s || !e || e <= s) return ''
  const hours = Math.round((e - s) / 36e5)
  return hours >= 48 ? `${Math.round(hours / 24)} 日間` : `${hours} 時間`
})

function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  const notice = { ...model.value, ...event.data } as NoticeDraft
  if (action.value === 'draft') emit('saveDraft', notice)
  else emit('schedule', notice)
}

function onError() {
  toast.add({ title: '入力内容を確認してください', color: 'error', icon: 'i-lucide-circle-alert' })
}

function submit(kind: 'draft' | 'schedule') {
  action.value = kind
  form.value?.submit()
}

const editable = computed(() => can('notice.edit'))
</script>

<template>
  <div class="grid gap-6" :class="props.preview ? 'xl:grid-cols-[1fr_20rem]' : ''">
    <UForm
      ref="form"
      :schema="schema"
      :state="model"
      :disabled="!editable"
      class="flex flex-col gap-6"
      @submit="onSubmit"
      @error="onError"
    >
      <UAlert
        v-if="!editable"
        icon="i-lucide-lock"
        color="neutral"
        variant="subtle"
        title="閲覧のみ"
        description="お知らせを編集するには「お知らせを作成・編集する」権限が必要です。"
      />

      <!-- 内容 -->
      <section class="space-y-4">
        <h3 class="text-sm font-semibold text-highlighted">
          内容
        </h3>
        <UFormField label="種別" name="category">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="c in categoryItems"
              :key="c.value"
              :label="c.label"
              :icon="c.icon"
              size="sm"
              :color="model.category === c.value ? NOTICE_CATEGORIES[c.value].color : 'neutral'"
              :variant="model.category === c.value ? 'soft' : 'outline'"
              :disabled="!editable"
              :aria-pressed="model.category === c.value"
              @click="model.category = c.value"
            />
          </div>
        </UFormField>

        <UFormField label="タイトル" name="title" required :hint="`${model.title.length} / ${TITLE_MAX}`">
          <UInput v-model="model.title" placeholder="例：定期メンテナンスのお知らせ" class="w-full" :maxlength="TITLE_MAX + 10" />
        </UFormField>

        <UFormField label="本文" name="body" required :hint="`${model.body.length} / ${BODY_MAX}`" description="改行はそのまま表示されます">
          <UTextarea v-model="model.body" :rows="7" autoresize :maxrows="14" placeholder="プレイヤーに伝える内容を入力" class="w-full" />
        </UFormField>
      </section>

      <USeparator />

      <!-- 掲載 -->
      <section class="space-y-4">
        <h3 class="text-sm font-semibold text-highlighted">
          掲載期間・対象
        </h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="開始日時" name="startAt" required>
            <UInput v-model="model.startAt" type="datetime-local" class="w-full" />
          </UFormField>
          <UFormField label="終了日時" name="endAt" required :hint="durationText">
            <UInput v-model="model.endAt" type="datetime-local" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="対象端末" name="platforms" required>
          <UCheckboxGroup v-model="model.platforms" :items="NOTICE_PLATFORMS" orientation="horizontal" />
        </UFormField>

        <UFormField label="対象プレイヤー" name="target">
          <USelect v-model="model.target" :items="NOTICE_TARGETS" class="w-full sm:w-72" />
        </UFormField>

        <UFormField label="表示方法" name="display">
          <URadioGroup
            v-model="model.display"
            :items="NOTICE_DISPLAYS.map(d => ({ label: d.label, value: d.value, description: d.description }))"
            variant="card"
            orientation="horizontal"
            :ui="{ fieldset: 'grid gap-2 sm:grid-cols-3', item: 'w-full' }"
          />
        </UFormField>
      </section>

      <USeparator />

      <!-- プッシュ -->
      <section class="space-y-4">
        <UFormField name="push">
          <USwitch v-model="model.push" label="プッシュ通知も送る" description="掲載開始時刻に、対象プレイヤーの端末へ通知します" />
        </UFormField>
        <UFormField v-if="model.push" label="通知の文言" name="pushText" required :hint="`${model.pushText.length} / ${PUSH_MAX}`">
          <UInput v-model="model.pushText" placeholder="例：11/15 2:00〜6:00 にメンテナンスを行います" class="w-full" />
        </UFormField>
      </section>

      <!-- 操作 -->
      <div class="flex flex-wrap items-center justify-end gap-2 border-t border-default pt-4">
        <AccessGuard permission="notice.edit" mode="disable">
          <UButton label="下書き保存" icon="i-lucide-save" color="neutral" variant="outline" @click="submit('draft')" />
        </AccessGuard>
        <AccessGuard permission="notice.publish" mode="disable">
          <UButton label="公開を予約" icon="i-lucide-calendar-check" @click="submit('schedule')" />
        </AccessGuard>
      </div>
    </UForm>

    <div v-if="props.preview" class="xl:sticky xl:top-24 xl:self-start">
      <NoticePreview :notice="model" />
    </div>
  </div>
</template>
