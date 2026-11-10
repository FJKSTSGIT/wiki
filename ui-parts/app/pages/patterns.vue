<script setup lang="ts">
import type { SideMenuGroup } from '~/components/parts/SideMenu.vue'
import { ALL_PATTERNS, IMPORTANCE, PATTERN_CATEGORIES, PATTERN_PRESETS, type Importance } from '~/utils/patterns'

useHead({ title: 'パターン一覧' })

const STORAGE_KEY = 'ui-parts:selected-patterns'
const toast = useToast()

/* ---------- 選択状態（このブラウザにだけ保存） ---------- */
const selected = ref<Set<string>>(new Set(PATTERN_PRESETS[0]!.ids))
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) selected.value = new Set(JSON.parse(raw))
  } catch { /* 保存領域が使えなくても動作は続ける */ }
})
watch(selected, (v) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...v]))
  } catch { /* 無視 */ }
}, { deep: true })

function toggle(id: string, value: boolean) {
  const next = new Set(selected.value)
  if (value) next.add(id)
  else next.delete(id)
  selected.value = next
}
function setCategory(categoryId: string, value: boolean) {
  const next = new Set(selected.value)
  for (const p of PATTERN_CATEGORIES.find(c => c.id === categoryId)!.patterns) {
    if (value) next.add(p.id)
    else next.delete(p.id)
  }
  selected.value = next
}
function applyPreset(ids: string[], label: string) {
  selected.value = new Set(ids)
  toast.add({ title: `「${label}」を選択しました`, description: `${ids.length} 件`, icon: 'i-lucide-list-checks' })
}

/* ---------- 絞り込み ---------- */
const q = ref('')
const importanceFilter = ref<Importance[]>([])
const onlySelected = ref(false)

const categories = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  return PATTERN_CATEGORIES.map(c => ({
    ...c,
    total: c.patterns.length,
    selectedCount: c.patterns.filter(p => selected.value.has(p.id)).length,
    visible: c.patterns.filter(p =>
      (!keyword || `${p.name}${p.description}${p.ui.join('')}`.toLowerCase().includes(keyword))
      && (!importanceFilter.value.length || importanceFilter.value.includes(p.importance))
      && (!onlySelected.value || selected.value.has(p.id)))
  })).filter(c => c.visible.length)
})

/* ---------- 集計・プレビュー ---------- */
const selectedPatterns = computed(() => ALL_PATTERNS.filter(p => selected.value.has(p.id)))
const countBy = (imp: Importance) => selectedPatterns.value.filter(p => p.importance === imp).length
const missingMust = computed(() => ALL_PATTERNS.filter(p => p.importance === 'must' && !selected.value.has(p.id)))

/** 選んだ構成から作ったサイドメニュー */
const menuPreview = computed<SideMenuGroup[]>(() => [{
  label: '選んだ構成のメニュー',
  items: PATTERN_CATEGORIES
    .map(c => ({ label: c.label, icon: c.icon, children: c.patterns.filter(p => selected.value.has(p.id)).map(p => ({ label: p.name })) }))
    .filter(c => c.children.length)
}])
const previewCollapsed = ref(false)

const selectionText = computed(() => [
  `# 管理ツール 機能一覧（${selectedPatterns.value.length} 件）`,
  '',
  ...PATTERN_CATEGORIES.flatMap((c) => {
    const items = c.patterns.filter(p => selected.value.has(p.id))
    return items.length
      ? [`## ${c.label}`, ...items.map(p => `- ${p.name}（${IMPORTANCE[p.importance].label}）：${p.description}`), '']
      : []
  })
].join('\n'))

async function copySelection() {
  try {
    await navigator.clipboard.writeText(selectionText.value)
    toast.add({ title: '選択内容をコピーしました', description: 'そのまま資料や依頼文に貼り付けられます', color: 'success', icon: 'i-lucide-check' })
  } catch {
    textOpen.value = true
  }
}
const textOpen = ref(false)
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6">
    <div>
      <h2 class="text-2xl font-semibold text-highlighted text-balance">
        ゲーム管理ツールの画面・機能パターン
      </h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">
        ゲーム運営の管理ツールでよく使われる画面・機能の一覧です。必要なものにチェックを入れると、選んだ構成のメニューイメージが表示されます（スマホでは一覧の下）。
        選択内容はこのブラウザに保存され、テキストでコピーして共有できます。
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <!-- 一覧 -->
      <div class="flex min-w-0 flex-col gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <UInput v-model="q" icon="i-lucide-search" placeholder="機能名・部品名で検索…" class="w-full sm:w-64" aria-label="パターンを検索" />
          <USelectMenu
            v-model="importanceFilter"
            :items="(Object.keys(IMPORTANCE) as Importance[]).map(k => ({ label: IMPORTANCE[k].label, value: k }))"
            value-key="value"
            multiple
            placeholder="重要度"
            icon="i-lucide-list-filter"
            class="w-40"
            aria-label="重要度で絞り込み"
          />
          <USwitch v-model="onlySelected" label="選択中のみ" size="sm" />
          <div class="ms-auto flex flex-wrap gap-1.5">
            <UButton
              v-for="p in PATTERN_PRESETS"
              :key="p.id"
              :label="p.label"
              size="sm"
              color="neutral"
              variant="outline"
              @click="applyPreset(p.ids, p.label)"
            />
            <UButton label="クリア" size="sm" color="neutral" variant="ghost" @click="selected = new Set()" />
          </div>
        </div>

        <UCard v-for="c in categories" :key="c.id" :ui="{ header: 'p-3 sm:px-4', body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <UIcon :name="c.icon" class="size-4 text-primary" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-highlighted">
                  {{ c.label }}
                </p>
                <p class="text-xs text-muted">
                  {{ c.description }}
                </p>
              </div>
              <span class="text-xs text-muted tabular-nums">{{ c.selectedCount }} / {{ c.total }}</span>
              <UCheckbox
                :model-value="c.selectedCount === 0 ? false : c.selectedCount === c.total ? true : 'indeterminate'"
                :aria-label="`${c.label}をすべて選択`"
                @update:model-value="(v: boolean | 'indeterminate') => setCategory(c.id, !!v)"
              />
            </div>
          </template>

          <ul class="divide-y divide-default">
            <li v-for="p in c.visible" :key="p.id">
              <label
                class="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-elevated/40"
                :class="selected.has(p.id) ? 'bg-primary/5' : ''"
              >
                <UCheckbox
                  :model-value="selected.has(p.id)"
                  class="mt-0.5"
                  :aria-label="p.name"
                  @update:model-value="(v: boolean | 'indeterminate') => toggle(p.id, !!v)"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="font-medium text-highlighted">{{ p.name }}</span>
                    <UBadge :label="IMPORTANCE[p.importance].label" :color="IMPORTANCE[p.importance].color" variant="subtle" size="sm" />
                  </div>
                  <p class="mt-0.5 text-sm text-muted">
                    {{ p.description }}
                  </p>
                  <div class="mt-1.5 flex flex-wrap items-center gap-1">
                    <span v-for="u in p.ui" :key="u" class="rounded bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-toned">{{ u }}</span>
                    <template v-if="p.sample">
                      <NuxtLink v-if="p.sample.to" :to="p.sample.to" class="ms-1 inline-flex items-center gap-0.5 text-xs text-primary hover:underline" @click.stop>
                        <UIcon name="i-lucide-eye" class="size-3.5" />{{ p.sample.label }}
                      </NuxtLink>
                      <span v-else class="ms-1 inline-flex items-center gap-0.5 text-xs text-success">
                        <UIcon name="i-lucide-monitor-check" class="size-3.5" />{{ p.sample.label }}で確認可
                      </span>
                    </template>
                  </div>
                </div>
              </label>
            </li>
          </ul>
        </UCard>

        <UEmpty v-if="!categories.length" icon="i-lucide-search-x" title="条件に合うパターンがありません" />
      </div>

      <!-- 選択結果 -->
      <div class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <UCard :ui="{ body: 'p-4 sm:p-4' }">
          <p class="text-xs text-muted">
            選択中
          </p>
          <p class="text-3xl font-semibold text-highlighted tabular-nums">
            {{ selectedPatterns.length }}<span class="text-base font-normal text-muted"> / {{ ALL_PATTERNS.length }} 件</span>
          </p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <UBadge v-for="imp in (Object.keys(IMPORTANCE) as Importance[])" :key="imp" :label="`${IMPORTANCE[imp].label} ${countBy(imp)}`" :color="IMPORTANCE[imp].color" variant="subtle" />
          </div>
          <UAlert
            v-if="missingMust.length"
            class="mt-3"
            icon="i-lucide-info"
            color="warning"
            variant="subtle"
            :title="`「ほぼ必須」が ${missingMust.length} 件未選択です`"
            :description="missingMust.slice(0, 3).map(p => p.name).join('、') + (missingMust.length > 3 ? ' など' : '')"
          />
          <div class="mt-4 flex gap-2">
            <UButton label="テキストでコピー" icon="i-lucide-copy" block @click="copySelection" />
            <UButton icon="i-lucide-file-text" color="neutral" variant="outline" square aria-label="テキストを表示" @click="textOpen = true" />
          </div>
        </UCard>

        <div class="h-[28rem] overflow-hidden rounded-lg border border-default">
          <SideMenu v-model:collapsed="previewCollapsed" :groups="menuPreview" contained>
            <template #header="{ collapsed: c }">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-inverted">
                <UIcon name="i-lucide-swords" class="size-4" />
              </span>
              <span v-if="!c" class="ms-2 truncate text-sm font-semibold text-highlighted">メニュー構成イメージ</span>
            </template>
          </SideMenu>
        </div>
      </div>
    </div>

    <!-- スマホ用：選択数とコピー -->
    <div class="sticky bottom-0 z-20 -mx-4 flex items-center gap-3 border-t border-default bg-default/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
      <p class="text-sm text-muted">
        選択中 <b class="text-lg text-highlighted tabular-nums">{{ selectedPatterns.length }}</b> / {{ ALL_PATTERNS.length }}
      </p>
      <UButton label="テキストでコピー" icon="i-lucide-copy" size="sm" class="ms-auto" @click="copySelection" />
    </div>

    <UModal v-model:open="textOpen" title="選択内容（テキスト）" description="選択して資料や依頼文に貼り付けてください">
      <template #body>
        <UTextarea :model-value="selectionText" readonly :rows="16" class="w-full font-mono text-xs" aria-label="選択内容" />
      </template>
    </UModal>
  </div>
</template>
