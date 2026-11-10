<script setup lang="ts">
/**
 * 候補案のプレビュー
 * 選んだパターンからメニューを組み立て、EnvHeader / SideMenu 部品でそのまま表示する。
 * メニューを押すと、その画面を案ごとに選んだレイアウト・項目で表示する。
 */
import type { SideMenuGroup } from '~/components/parts/SideMenu.vue'
import type { Candidate } from '~/composables/useBuilder'
import { IMPORTANCE, PATTERN_CATEGORIES, type Pattern } from '~/utils/patterns'
import { resolveScreen, screenSpecOf } from '~/utils/screens'

const props = withDefaults(defineProps<{ candidate: Candidate, height?: string }>(), { height: '34rem' })

/** 表示中の画面（パターン ID）。親と共有して「画面の中身」の編集に使う */
const selectedId = defineModel<string | undefined>('screen')
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

const spec = computed(() => selected.value ? screenSpecOf(selected.value.id, selected.value.name) : undefined)
const resolved = computed(() => spec.value ? resolveScreen(spec.value, props.candidate.screens?.[selected.value!.id]) : undefined)

// 表示中の画面が案から外れたら、先頭の画面に戻す
watch(selected, (p) => { if (p && p.id !== selectedId.value) selectedId.value = p.id }, { immediate: true })

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
        <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
          <span>{{ selectedCategory?.label }}</span>
          <UIcon name="i-lucide-chevron-right" class="size-3" />
          <span class="text-highlighted">{{ selected.name }}</span>
          <UBadge :label="IMPORTANCE[selected.importance].label" :color="IMPORTANCE[selected.importance].color" variant="subtle" size="sm" class="ms-auto" />
        </div>

        <ScreenView
          v-if="spec && resolved"
          :spec="spec"
          :layout="resolved.layout"
          :blocks="resolved.blocks"
          :title="selected.name"
          :description="selected.description"
        />

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
