<script setup lang="ts">
/** 部品カタログの 1 ページ分の枠（説明・デモ・使い方・Props） */
defineProps<{
  title: string
  summary: string
  file: string
  points?: string[]
  code?: string
  props?: { name: string, type: string, default?: string, description: string }[]
}>()

defineSlots<{
  demo(): any
  controls?(): any
  extra?(): any
}>()

const toast = useToast()
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: 'コードをコピーしました', icon: 'i-lucide-check', color: 'success' })
  } catch {
    toast.add({ title: 'コピーできませんでした', description: 'コードを選択してコピーしてください', color: 'warning' })
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div>
      <p class="font-mono text-xs text-muted">
        {{ file }}
      </p>
      <h2 class="mt-1 text-2xl font-semibold text-highlighted text-balance">
        {{ title }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">
        {{ summary }}
      </p>
      <ul v-if="points?.length" class="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
        <li v-for="p in points" :key="p" class="flex gap-2">
          <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{{ p }}</span>
        </li>
      </ul>
    </div>

    <UCard :ui="{ header: 'p-3 sm:px-4', body: 'p-0 sm:p-0' }">
      <template v-if="$slots.controls" #header>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <span class="text-xs font-medium text-muted">デモの設定</span>
          <slot name="controls" />
        </div>
      </template>
      <div class="overflow-hidden rounded-b-[inherit]">
        <slot name="demo" />
      </div>
    </UCard>

    <slot name="extra" />

    <div v-if="code" class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-highlighted">
          使い方
        </h3>
        <UButton label="コピー" icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" @click="copy(code)" />
      </div>
      <pre class="overflow-x-auto rounded-lg border border-default bg-elevated/50 p-4 text-xs leading-relaxed"><code>{{ code }}</code></pre>
    </div>

    <div v-if="props?.length" class="space-y-2">
      <h3 class="text-sm font-semibold text-highlighted">
        Props
      </h3>
      <div class="overflow-x-auto rounded-lg border border-default">
        <table class="w-full min-w-[36rem] text-sm">
          <thead class="bg-elevated/50 text-left text-xs text-muted">
            <tr>
              <th class="px-4 py-2 font-medium">
                名前
              </th>
              <th class="px-4 py-2 font-medium">
                型
              </th>
              <th class="px-4 py-2 font-medium">
                初期値
              </th>
              <th class="px-4 py-2 font-medium">
                説明
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr v-for="p in props" :key="p.name">
              <td class="px-4 py-2 font-mono text-xs text-highlighted">
                {{ p.name }}
              </td>
              <td class="px-4 py-2 font-mono text-xs text-muted">
                {{ p.type }}
              </td>
              <td class="px-4 py-2 font-mono text-xs text-muted">
                {{ p.default ?? '—' }}
              </td>
              <td class="px-4 py-2">
                {{ p.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
