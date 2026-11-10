<script setup lang="ts">
/**
 * 候補案のプレビュー
 * 選んだパターンからメニューを組み立て、EnvHeader / SideMenu 部品でそのまま表示する。
 * メニューを押すと、その画面の構成イメージ（ワイヤーフレーム）を表示。
 */
import type { SideMenuGroup } from '~/components/parts/SideMenu.vue'
import type { Candidate } from '~/composables/useBuilder'
import { IMPORTANCE, PATTERN_CATEGORIES, type Pattern } from '~/utils/patterns'

const props = withDefaults(defineProps<{ candidate: Candidate, height?: string }>(), { height: '34rem' })

const selectedId = ref<string>()
const collapsed = ref(props.candidate.settings.layout === 'compact')
watch(() => props.candidate.settings.layout, (l) => { collapsed.value = l === 'compact' })

const categories = computed(() => PATTERN_CATEGORIES
  .map(c => ({ ...c, items: c.patterns.filter(p => props.candidate.patterns.includes(p.id)) }))
  .filter(c => c.items.length))

const selected = computed<Pattern | undefined>(() => {
  const all = categories.value.flatMap(c => c.items)
  return all.find(p => p.id === selectedId.value) ?? all[0]
})
const selectedCategory = computed(() => categories.value.find(c => c.items.some(p => p.id === selected.value?.id)))

const groups = computed<SideMenuGroup[]>(() => [{
  items: categories.value.map(c => ({
    label: c.label,
    icon: c.icon,
    children: c.items.map(p => ({ label: p.name, active: p.id === selected.value?.id, onSelect: () => { selectedId.value = p.id } }))
  }))
}])

const topItems = computed(() => categories.value.map(c => ({
  label: c.label,
  icon: c.icon,
  active: c.id === selectedCategory.value?.id,
  onSelect: () => { selectedId.value = c.items[0]?.id }
})))

/** 画面のワイヤーフレームの種類（主に使う部品から決める） */
const kind = computed(() => {
  const ui = selected.value?.ui.join(' ') ?? ''
  if (/Chart/.test(ui) && !/Table/.test(ui.split(' ')[0] ?? '')) return 'chart'
  if (/^Form|NoticeSettings|Stepper/.test(selected.value?.ui[0] ?? '')) return 'form'
  if (/Calendar/.test(ui) && /Calendar/.test(selected.value?.ui[0] ?? '')) return 'calendar'
  if (/Card/.test(selected.value?.ui[0] ?? '')) return 'cards'
  return 'table'
})

const themeStyle = computed(() => ({
  '--ui-primary': `var(--color-${props.candidate.settings.color}-500)`
}))
</script>

<template>
  <div class="flex overflow-hidden rounded-lg border border-default bg-default" :style="{ ...themeStyle, height }">
    <SideMenu
      v-if="candidate.settings.layout !== 'topnav'"
      v-model:collapsed="collapsed"
      :groups="groups"
      :filter-by-permission="false"
      contained
      class="!w-auto"
      :class="collapsed ? '' : 'min-w-56 max-w-60'"
    >
      <template #header="{ collapsed: c }">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-inverted">
          <UIcon name="i-lucide-swords" class="size-4" />
        </span>
        <span v-if="!c" class="ms-2 truncate text-sm font-semibold text-highlighted">{{ candidate.settings.productName || 'Game Admin' }}</span>
      </template>
    </SideMenu>

    <div class="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <EnvHeader class="shrink-0" :env="candidate.settings.env" :title="selected?.name ?? '画面がありません'" :menu-button="false">
        <template v-if="candidate.settings.layout === 'topnav'" #left>
          <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-inverted">
            <UIcon name="i-lucide-swords" class="size-4" />
          </span>
          <span class="truncate text-sm font-semibold text-highlighted">{{ candidate.settings.productName || 'Game Admin' }}</span>
        </template>
        <template #right>
          <UAvatar alt="管理 太郎" size="xs" />
        </template>
      </EnvHeader>

      <div v-if="candidate.settings.layout === 'topnav'" class="shrink-0 overflow-x-auto border-b border-default px-2">
        <div class="flex gap-1 py-1.5">
          <UButton
            v-for="t in topItems"
            :key="t.label"
            :label="t.label"
            :icon="t.icon"
            size="xs"
            :color="t.active ? 'primary' : 'neutral'"
            :variant="t.active ? 'soft' : 'ghost'"
            class="shrink-0"
            @click="t.onSelect()"
          />
        </div>
        <div v-if="selectedCategory" class="flex gap-1 overflow-x-auto pb-1.5">
          <UButton
            v-for="p in selectedCategory.items"
            :key="p.id"
            :label="p.name"
            size="xs"
            variant="link"
            :color="p.id === selected?.id ? 'primary' : 'neutral'"
            class="shrink-0"
            @click="selectedId = p.id"
          />
        </div>
      </div>

      <div v-if="selected" class="flex flex-col gap-4 p-4">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-xs text-muted">
              {{ selectedCategory?.label }}
            </p>
            <p class="font-semibold text-highlighted">
              {{ selected.name }}
            </p>
            <p class="text-xs text-muted">
              {{ selected.description }}
            </p>
          </div>
          <UBadge :label="IMPORTANCE[selected.importance].label" :color="IMPORTANCE[selected.importance].color" variant="subtle" size="sm" />
        </div>

        <!-- ワイヤーフレーム -->
        <div v-if="kind === 'table'" class="space-y-2">
          <div class="flex gap-2">
            <USkeleton class="h-7 w-48" />
            <USkeleton class="h-7 w-24" />
            <div class="ms-auto h-7 w-16 rounded-md bg-primary/30" />
          </div>
          <div class="overflow-hidden rounded-md border border-default">
            <div class="flex gap-3 bg-elevated/60 px-3 py-2">
              <USkeleton v-for="i in 4" :key="i" class="h-3 flex-1" />
            </div>
            <div v-for="r in 6" :key="r" class="flex gap-3 border-t border-default px-3 py-2.5">
              <USkeleton v-for="i in 4" :key="i" class="h-3 flex-1" :class="i === 1 ? 'max-w-24' : ''" />
            </div>
          </div>
        </div>
        <div v-else-if="kind === 'form'" class="max-w-md space-y-3">
          <div v-for="i in 4" :key="i" class="space-y-1.5">
            <USkeleton class="h-3 w-20" />
            <USkeleton class="h-8 w-full" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <USkeleton class="h-8 w-20" />
            <div class="h-8 w-24 rounded-md bg-primary/30" />
          </div>
        </div>
        <div v-else-if="kind === 'chart'" class="space-y-3">
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div v-for="i in 4" :key="i" class="space-y-2 rounded-md border border-default p-3">
              <USkeleton class="h-3 w-12" />
              <USkeleton class="h-5 w-20" />
            </div>
          </div>
          <div class="flex h-36 items-end gap-1.5 rounded-md border border-default p-3">
            <div v-for="(h, i) in [40, 55, 35, 70, 60, 85, 50, 75, 90, 65, 80, 95]" :key="i" class="flex-1 rounded-sm bg-primary/30" :style="{ height: `${h}%` }" />
          </div>
        </div>
        <div v-else-if="kind === 'calendar'" class="grid grid-cols-7 gap-1">
          <div v-for="i in 28" :key="i" class="h-12 rounded-sm border border-default p-1">
            <div v-if="i % 5 === 0 || i % 7 === 2" class="h-2 w-full rounded-sm bg-primary/30" />
          </div>
        </div>
        <div v-else class="grid gap-2 sm:grid-cols-2">
          <div v-for="i in 4" :key="i" class="space-y-2 rounded-md border border-default p-3">
            <USkeleton class="h-16 w-full" />
            <USkeleton class="h-3 w-2/3" />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1 text-xs text-muted">
          使う部品：
          <span v-for="u in selected.ui" :key="u" class="rounded bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-toned">{{ u }}</span>
        </div>
      </div>

      <div v-else class="flex flex-1 items-center justify-center p-6">
        <UEmpty icon="i-lucide-list-checks" title="機能が選ばれていません" description="左の一覧から機能を選ぶと、ここにメニューと画面のイメージが表示されます" size="sm" />
      </div>
    </div>
  </div>
</template>
