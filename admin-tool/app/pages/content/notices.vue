<script setup lang="ts">
const ST = { published: { label: '公開中', color: 'success' }, scheduled: { label: '予約', color: 'info' }, draft: { label: '下書き', color: 'neutral' }, archived: { label: 'アーカイブ', color: 'warning' } } as const
const editing = ref<(typeof NOTICES)[number] | null>(null)
const body = ref('')
</script>

<template>
  <PageShell id="notices" title="お知らせ" icon="i-lucide-megaphone" description="ストアに表示するお知らせ">
    <template #actions>
      <UButton icon="i-lucide-plus" size="sm" label="新規作成" @click="editing = { id: 0, title: '', status: 'draft', audience: '全員', publishAt: '-', author: '山田 太郎' }" />
    </template>
    <div class="grid grid-cols-1 gap-3">
      <UCard v-for="n in NOTICES" :key="n.id" :ui="{ body: 'p-4 sm:p-4' }" class="hover:ring-accented transition cursor-pointer" @click="editing = n">
        <div class="flex items-center gap-4">
          <UBadge :color="ST[n.status as keyof typeof ST].color" variant="subtle">{{ ST[n.status as keyof typeof ST].label }}</UBadge>
          <p class="text-highlighted font-medium">{{ n.title }}</p>
          <span class="ml-auto text-xs text-muted flex items-center gap-4">
            <span class="flex items-center gap-1"><UIcon name="i-lucide-users" class="size-3.5" />{{ n.audience }}</span>
            <span class="flex items-center gap-1"><UIcon name="i-lucide-calendar" class="size-3.5" />{{ n.publishAt }}</span>
            <span>{{ n.author }}</span>
          </span>
        </div>
      </UCard>
    </div>

    <USlideover :open="!!editing" :title="editing?.id ? 'お知らせを編集' : 'お知らせを作成'" :ui="{ content: 'max-w-2xl' }" @update:open="v => !v && (editing = null)">
      <template #body>
        <div v-if="editing" class="space-y-4">
          <UFormField label="タイトル"><UInput v-model="editing.title" class="w-full" /></UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="対象"><USelect v-model="editing.audience" :items="['全員', '会員', 'ゴールド会員']" class="w-full" /></UFormField>
            <UFormField label="公開日時"><UInput type="datetime-local" class="w-full" /></UFormField>
          </div>
          <UFormField label="本文 (Markdown)"><UTextarea v-model="body" :rows="12" class="w-full font-mono" placeholder="## 見出し&#10;本文..." /></UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2 w-full justify-end">
          <UButton color="neutral" variant="ghost" label="下書き保存" @click="editing = null" />
          <UButton icon="i-lucide-calendar-clock" label="予約公開" @click="editing = null" />
        </div>
      </template>
    </USlideover>
  </PageShell>
</template>
