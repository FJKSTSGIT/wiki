<script setup lang="ts">
import { format } from 'date-fns'
import { createNoticeDraft, NOTICE_CATEGORIES, sampleNoticeDraft, type NoticeDraft } from '~/utils/notice'

useHead({ title: 'お知らせ設定' })

const toast = useToast()
const draft = ref<NoticeDraft>(sampleNoticeDraft())
const showPreview = ref(true)

interface SavedNotice extends NoticeDraft { id: number, status: 'draft' | 'scheduled' }
const saved = ref<SavedNotice[]>([])

function onSave(notice: NoticeDraft, status: SavedNotice['status']) {
  saved.value.unshift({ ...notice, id: Date.now(), status })
  toast.add({
    title: status === 'draft' ? '下書きを保存しました' : '公開を予約しました',
    description: status === 'scheduled' ? `${format(new Date(notice.startAt), 'M/d HH:mm')} に公開されます（サンプル）` : notice.title,
    color: 'success',
    icon: status === 'draft' ? 'i-lucide-save' : 'i-lucide-calendar-check'
  })
}

const code = `<script setup lang="ts">
import { createNoticeDraft, type NoticeDraft } from '~/utils/notice'

const draft = ref<NoticeDraft>(createNoticeDraft())

async function schedule(notice: NoticeDraft) {
  await $fetch('/api/notices', { method: 'POST', body: { ...notice, status: 'scheduled' } })
}
<\/script>

<template>
  <NoticeSettings
    v-model="draft"
    @save-draft="n => saveDraft(n)"
    @schedule="schedule"
  />
</template>`

const propsTable = [
  { name: 'v-model', type: 'NoticeDraft', description: '入力内容（種別・タイトル・本文・期間・対象・表示方法・プッシュ通知）' },
  { name: 'preview', type: 'boolean', default: 'true', description: 'ゲーム内表示のプレビューを横に出す' },
  { name: '@save-draft', type: '(notice) => void', description: '「下書き保存」で発火（notice.edit 権限が必要）' },
  { name: '@schedule', type: '(notice) => void', description: '「公開を予約」で発火（notice.publish 権限が必要）' }
]
</script>

<template>
  <PartDoc
    title="お知らせ設定"
    file="components/parts/NoticeSettings.vue / NoticePreview.vue"
    summary="ゲーム内でプレイヤーに表示するお知らせを作成し、掲載期間・対象・表示方法・プッシュ通知を設定するフォームです。入力に合わせてゲーム内の表示イメージが変わります。"
    :points="['種別（メンテナンス・イベントなど）ごとに色分け', '掲載期間・対象端末・対象プレイヤーの指定', '通常 / 上部に固定 / ログイン時に表示 の選択', '入力チェック（文字数・期間の前後・必須項目）', '「公開を予約」は公開権限がある人だけ押せる']"
    :code="code"
    :props="propsTable"
  >
    <template #controls>
      <UButton label="サンプルを入れる" size="xs" color="neutral" variant="outline" icon="i-lucide-wand-sparkles" @click="draft = sampleNoticeDraft()" />
      <UButton label="空にする" size="xs" color="neutral" variant="outline" icon="i-lucide-eraser" @click="draft = createNoticeDraft()" />
      <USwitch v-model="showPreview" label="プレビュー" size="sm" />
      <span class="flex items-center gap-2"><span class="text-xs text-muted">役割</span><RoleSwitcher size="sm" /></span>
    </template>

    <template #demo>
      <div class="p-4 sm:p-6">
        <NoticeSettings v-model="draft" :preview="showPreview" @save-draft="n => onSave(n, 'draft')" @schedule="n => onSave(n, 'scheduled')" />
      </div>
    </template>

    <template v-if="saved.length" #extra>
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-highlighted">
          保存したお知らせ（このページを開いている間だけ保持）
        </h3>
        <ul class="divide-y divide-default rounded-lg border border-default text-sm">
          <li v-for="n in saved" :key="n.id" class="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <UBadge :label="NOTICE_CATEGORIES[n.category].label" :color="NOTICE_CATEGORIES[n.category].color" variant="subtle" />
            <span class="min-w-0 flex-1 truncate text-highlighted">{{ n.title }}</span>
            <span class="text-xs text-muted tabular-nums">{{ format(new Date(n.startAt), 'M/d HH:mm') }} 〜 {{ format(new Date(n.endAt), 'M/d HH:mm') }}</span>
            <UBadge :label="n.status === 'draft' ? '下書き' : '公開予約'" :color="n.status === 'draft' ? 'neutral' : 'success'" variant="outline" />
          </li>
        </ul>
      </div>
    </template>
  </PartDoc>
</template>
