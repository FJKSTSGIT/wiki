<script setup lang="ts">
import { CANDIDATE_COLORS, CANDIDATE_LAYOUTS, CANDIDATE_STATUS, type Candidate, type CandidateStatus } from '~/composables/useBuilder'
import { ENVIRONMENTS, ENV_KEYS } from '~/utils/environments'
import { ALL_PATTERNS, IMPORTANCE, PATTERN_CATEGORIES, PATTERN_PRESETS } from '~/utils/patterns'
import { SCREEN_TYPES, resolveScreen, screenSpecOf, type ScreenChoice } from '~/utils/screens'

useHead({ title: '組み立てツール' })

const toast = useToast()
const { state, writable, voteCounts, updateCandidate, createCandidate, deleteCandidate, vote, setPresence, nameOf } = useBuilder()

/* ---------- 選択中の案 ---------- */
const selectedId = ref<string>()
const current = computed<Candidate | undefined>(() =>
  state.candidates.find(c => c.id === selectedId.value) ?? (state.candidates[0] as Candidate | undefined))
watch(() => current.value?.id, id => setPresence(id), { immediate: true })

const view = ref<'edit' | 'compare' | 'present'>('edit')
/** 編集中にプレビューを広く表示する（左の設定欄を隠す） */
const wide = ref(false)

/* ---------- 表示中の画面と、その中身の選択 ---------- */
const screenId = ref<string>()
const screenPattern = computed(() => ALL_PATTERNS.find(p => p.id === screenId.value && current.value?.patterns.includes(p.id)))
const screenSpec = computed(() => screenPattern.value ? screenSpecOf(screenPattern.value.id, screenPattern.value.name) : undefined)
function setScreen(choice: ScreenChoice) {
  if (!current.value || !screenPattern.value) return
  update({ screens: { [screenPattern.value.id]: choice } }, 300)
}
/** 案の画面ごとの選択を、人が読める文にする */
function screenSummary(c: Candidate, patternId: string) {
  const p = ALL_PATTERNS.find(x => x.id === patternId)!
  const spec = screenSpecOf(p.id, p.name)
  const r = resolveScreen(spec, c.screens?.[p.id])
  return { layout: SCREEN_TYPES[spec.type].layouts.find(l => l.value === r.layout)?.label ?? '', blocks: r.blocks.map(b => b.label), customized: !!c.screens?.[p.id] }
}
const viewTabs = [
  { label: '編集', value: 'edit', icon: 'i-lucide-pencil-ruler' },
  { label: '比較', value: 'compare', icon: 'i-lucide-columns-3' },
  { label: '発表', value: 'present', icon: 'i-lucide-presentation' }
]

/* ---------- 接続状態・同時閲覧 ---------- */
const connection = computed(() => ({
  connecting: { label: '接続中…', color: 'neutral' as const, icon: 'i-lucide-loader' },
  shared: { label: 'リアルタイム共有中', color: 'success' as const, icon: 'i-lucide-radio' },
  local: { label: 'このブラウザに保存', color: 'warning' as const, icon: 'i-lucide-hard-drive' }
})[state.mode])

const viewersOf = (id: string) => state.peers.filter(p => p.candidateId === id)
const others = computed(() => state.peers.filter(p => !p.isMe))

/* ---------- 案の作成・削除 ---------- */
async function create(name: string, patterns: string[], base?: Partial<Candidate>) {
  const id = await createCandidate(name, patterns, base)
  if (id) {
    selectedId.value = id
    view.value = 'edit'
    toast.add({ title: `「${name}」を作成しました`, icon: 'i-lucide-plus', color: 'success' })
  }
}
const nextLetter = computed(() => String.fromCharCode(65 + state.candidates.length))
const createMenu = computed(() => [[
  ...PATTERN_PRESETS.map(p => ({
    label: `${p.label}から作る`,
    description: p.description,
    icon: 'i-lucide-layers',
    onSelect: () => create(`案${nextLetter.value}：${p.label}`, p.ids)
  })),
  { label: '空の案を作る', icon: 'i-lucide-file-plus', onSelect: () => create(`案${nextLetter.value}`, []) }
], current.value
  ? [{
      label: `「${current.value.name}」を複製`,
      icon: 'i-lucide-copy',
      onSelect: () => create(`${current.value!.name} のコピー`, current.value!.patterns, { memo: current.value!.memo, settings: { ...current.value!.settings }, screens: current.value!.screens })
    }]
  : []])

const deleteOpen = ref(false)
async function confirmDelete() {
  if (!current.value) return
  const name = current.value.name
  await deleteCandidate(current.value.id)
  selectedId.value = undefined
  deleteOpen.value = false
  toast.add({ title: `「${name}」を削除しました`, icon: 'i-lucide-trash-2' })
}

/* ---------- 編集 ---------- */
function update(patch: Partial<Omit<Candidate, 'id'>>, delay?: number) {
  if (current.value) updateCandidate(current.value.id, patch, delay)
}
function togglePattern(id: string, on: boolean) {
  if (!current.value) return
  const set = new Set(current.value.patterns)
  if (on) set.add(id)
  else set.delete(id)
  update({ patterns: ALL_PATTERNS.filter(p => set.has(p.id)).map(p => p.id) }, 150)
}
function toggleCategory(categoryId: string, on: boolean) {
  if (!current.value) return
  const set = new Set(current.value.patterns)
  for (const p of PATTERN_CATEGORIES.find(c => c.id === categoryId)!.patterns) {
    if (on) set.add(p.id)
    else set.delete(p.id)
  }
  update({ patterns: ALL_PATTERNS.filter(p => set.has(p.id)).map(p => p.id) }, 150)
}
const openCategories = ref<string[]>([PATTERN_CATEGORIES[0]!.id])
const patternSearch = ref('')
const filteredCategories = computed(() => {
  const q = patternSearch.value.trim().toLowerCase()
  return PATTERN_CATEGORIES.map(c => ({
    ...c,
    visible: c.patterns.filter(p => !q || `${p.name}${p.description}`.toLowerCase().includes(q))
  })).filter(c => c.visible.length)
})

const myVote = computed(() => (state.myId ? state.votes[state.myId] : undefined))
function toggleVote(id: string) {
  vote(myVote.value === id ? null : id)
}

/* ---------- 比較 ---------- */
const compareRows = computed(() => PATTERN_CATEGORIES.map(c => ({
  ...c,
  rows: c.patterns.filter(p => state.candidates.some(cand => cand.patterns.includes(p.id)))
})).filter(c => c.rows.length))

/* ---------- テキスト出力 ---------- */
const textOpen = ref(false)
const summaryText = computed(() => state.candidates.map(c => [
  `# ${c.name}（${CANDIDATE_STATUS[c.status].label}・${c.patterns.length} 機能・推し ${voteCounts.value[c.id] ?? 0}）`,
  c.memo ? `> ${c.memo}` : '',
  `レイアウト：${CANDIDATE_LAYOUTS.find(l => l.value === c.settings.layout)?.label} / テーマ色：${c.settings.color}`,
  ...PATTERN_CATEGORIES.flatMap((cat) => {
    const items = cat.patterns.filter(p => c.patterns.includes(p.id))
    return items.length
      ? [`## ${cat.label}`, ...items.map((p) => {
          const sc = screenSummary(c, p.id)
          return sc.customized ? `- ${p.name}（${sc.layout}：${sc.blocks.join('・')}）` : `- ${p.name}`
        })]
      : []
  }),
  ''
].filter(Boolean).join('\n')).join('\n\n'))

async function copySummary() {
  try {
    await navigator.clipboard.writeText(summaryText.value)
    toast.add({ title: '全案の内容をコピーしました', color: 'success', icon: 'i-lucide-check' })
  } catch {
    textOpen.value = true
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-5">
    <!-- 見出し -->
    <div class="flex flex-wrap items-start gap-4">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-semibold text-highlighted text-balance">
          管理ツール組み立て
        </h2>
        <p class="mt-1 max-w-3xl text-sm text-muted">
          機能を選んで管理ツールの候補案を作り、並べて比較・発表できます。共有したページでは、参加者全員の変更がリアルタイムに反映されます。
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge :label="connection.label" :color="connection.color" :icon="connection.icon" variant="subtle" />
        <UTooltip v-if="others.length" :text="others.map(p => nameOf(p.by)).join('、') + ' が閲覧中'">
          <UAvatarGroup size="xs" :max="5">
            <UAvatar v-for="p in others" :key="p.peer" :alt="nameOf(p.by)" />
          </UAvatarGroup>
        </UTooltip>
        <UButton label="全案をコピー" icon="i-lucide-copy" size="sm" color="neutral" variant="outline" @click="copySummary" />
      </div>
    </div>

    <UAlert v-if="state.notice" icon="i-lucide-info" color="warning" variant="subtle" :description="state.notice" />

    <!-- 候補案 -->
    <div class="flex gap-3 overflow-x-auto pb-1">
      <button
        v-for="c in state.candidates"
        :key="c.id"
        type="button"
        class="flex w-56 shrink-0 flex-col gap-2 rounded-lg border p-3 text-left transition-colors"
        :class="c.id === current?.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-default hover:bg-elevated/50'"
        @click="selectedId = c.id"
      >
        <div class="flex items-start gap-2">
          <span class="mt-1 size-2.5 shrink-0 rounded-full" :style="{ background: `var(--color-${c.settings.color}-500)` }" />
          <span class="min-w-0 flex-1 truncate font-medium text-highlighted">{{ c.name || '名前なし' }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <UBadge :label="CANDIDATE_STATUS[c.status].label" :color="CANDIDATE_STATUS[c.status].color" variant="subtle" size="sm" />
          <span class="text-xs text-muted tabular-nums">{{ c.patterns.length }} 機能</span>
          <span class="ms-auto flex items-center gap-0.5 text-xs tabular-nums" :class="myVote === c.id ? 'text-primary' : 'text-muted'">
            <UIcon :name="myVote === c.id ? 'i-lucide-thumbs-up' : 'i-lucide-thumbs-up'" class="size-3.5" />{{ voteCounts[c.id] ?? 0 }}
          </span>
        </div>
        <div class="flex h-5 items-center gap-1">
          <UAvatarGroup v-if="viewersOf(c.id).length" size="3xs" :max="4">
            <UAvatar v-for="p in viewersOf(c.id)" :key="p.peer" :alt="nameOf(p.by)" />
          </UAvatarGroup>
          <span class="truncate text-[11px] text-dimmed">{{ c.updatedBy ? `${nameOf(c.updatedBy)}が更新` : '' }}</span>
        </div>
      </button>

      <UDropdownMenu v-if="writable" :items="createMenu" :content="{ align: 'start' }" :ui="{ content: 'w-64' }">
        <button type="button" class="flex w-40 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-default p-3 text-sm text-muted hover:bg-elevated/50">
          <UIcon name="i-lucide-plus" class="size-5" />
          新しい案
        </button>
      </UDropdownMenu>
    </div>

    <UEmpty
      v-if="state.mode !== 'connecting' && !state.candidates.length"
      icon="i-lucide-layout-template"
      title="まだ案がありません"
      description="「新しい案」から、最小構成・標準構成などをもとに作れます。"
    />
    <div v-else-if="state.mode === 'connecting'" class="space-y-3">
      <USkeleton class="h-10 w-72" />
      <USkeleton class="h-96 w-full" />
    </div>

    <template v-else-if="current">
      <UTabs v-model="view" :items="viewTabs" :content="false" variant="link" class="-mb-2" />

      <!-- 編集 -->
      <div v-if="view === 'edit'" class="grid gap-5" :class="wide ? '' : 'lg:grid-cols-[22rem_1fr]'">
        <div v-show="!wide" class="flex min-w-0 flex-col gap-4">
          <UCard :ui="{ body: 'p-4 sm:p-4 space-y-4' }">
            <UFormField label="案の名前">
              <UInput :model-value="current.name" :disabled="!writable" class="w-full" @update:model-value="(v: string) => update({ name: v })" />
            </UFormField>
            <UFormField label="メモ（ねらい・特徴）">
              <UTextarea :model-value="current.memo" :disabled="!writable" :rows="2" autoresize class="w-full" placeholder="例：まずは必須機能だけで早く出す" @update:model-value="(v: string) => update({ memo: v })" />
            </UFormField>
            <UFormField label="ステータス">
              <USelect
                :model-value="current.status"
                :items="(Object.keys(CANDIDATE_STATUS) as CandidateStatus[]).map(k => ({ label: CANDIDATE_STATUS[k].label, value: k }))"
                :disabled="!writable"
                class="w-full"
                @update:model-value="(v: CandidateStatus) => update({ status: v }, 0)"
              />
            </UFormField>

            <USeparator label="見た目" />

            <UFormField label="ツール名">
              <UInput :model-value="current.settings.productName" :disabled="!writable" class="w-full" @update:model-value="(v: string) => update({ settings: { ...current!.settings, productName: v } })" />
            </UFormField>
            <UFormField label="テーマ色">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="col in CANDIDATE_COLORS"
                  :key="col"
                  type="button"
                  class="size-7 rounded-full ring-offset-2 ring-offset-(--ui-bg) transition"
                  :class="current.settings.color === col ? 'ring-2 ring-(--ui-border-inverted)' : ''"
                  :style="{ background: `var(--color-${col}-500)` }"
                  :aria-label="col"
                  :aria-pressed="current.settings.color === col"
                  :disabled="!writable"
                  @click="update({ settings: { ...current!.settings, color: col } }, 0)"
                />
              </div>
            </UFormField>
            <UFormField label="メニューの配置">
              <URadioGroup
                :model-value="current.settings.layout"
                :items="CANDIDATE_LAYOUTS.map(l => ({ label: l.label, value: l.value, description: l.description }))"
                :disabled="!writable"
                size="sm"
                @update:model-value="(v: any) => update({ settings: { ...current!.settings, layout: v } }, 0)"
              />
            </UFormField>
            <UFormField label="プレビューの接続先環境">
              <USelect
                :model-value="current.settings.env"
                :items="ENV_KEYS.map(k => ({ label: ENVIRONMENTS[k].label, value: k }))"
                :disabled="!writable"
                class="w-full"
                @update:model-value="(v: any) => update({ settings: { ...current!.settings, env: v } }, 0)"
              />
            </UFormField>
          </UCard>

          <UCard :ui="{ header: 'p-3 sm:px-4', body: 'p-0 sm:p-0' }">
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-highlighted">
                  機能（{{ current.patterns.length }} / {{ ALL_PATTERNS.length }}）
                </p>
                <UInput v-model="patternSearch" icon="i-lucide-search" size="sm" placeholder="検索" class="w-32" aria-label="機能を検索" />
              </div>
            </template>
            <div class="max-h-[32rem] divide-y divide-default overflow-y-auto">
              <div v-for="c in filteredCategories" :key="c.id">
                <div class="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-highlighted"
                    :aria-expanded="openCategories.includes(c.id) || !!patternSearch"
                    @click="openCategories = openCategories.includes(c.id) ? openCategories.filter(x => x !== c.id) : [...openCategories, c.id]"
                  >
                    <UIcon :name="openCategories.includes(c.id) || patternSearch ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" class="size-4 shrink-0 text-muted" />
                    <UIcon :name="c.icon" class="size-4 shrink-0 text-muted" />
                    <span class="truncate">{{ c.label }}</span>
                    <span class="ms-auto text-xs font-normal text-muted tabular-nums">{{ c.patterns.filter(p => current!.patterns.includes(p.id)).length }}/{{ c.patterns.length }}</span>
                  </button>
                  <UCheckbox
                    :model-value="(() => { const n = c.patterns.filter(p => current!.patterns.includes(p.id)).length; return n === 0 ? false : n === c.patterns.length ? true : 'indeterminate' })()"
                    :disabled="!writable"
                    :aria-label="`${c.label}をすべて選択`"
                    @update:model-value="(v: boolean | 'indeterminate') => toggleCategory(c.id, !!v)"
                  />
                </div>
                <ul v-if="openCategories.includes(c.id) || patternSearch" class="pb-2">
                  <li v-for="p in c.visible" :key="p.id">
                    <label class="flex cursor-pointer items-center gap-2 px-3 py-1.5 ps-9 text-sm hover:bg-elevated/40">
                      <UCheckbox
                        :model-value="current.patterns.includes(p.id)"
                        :disabled="!writable"
                        :aria-label="p.name"
                        @update:model-value="(v: boolean | 'indeterminate') => togglePattern(p.id, !!v)"
                      />
                      <span class="min-w-0 flex-1 truncate">{{ p.name }}</span>
                      <span class="size-1.5 shrink-0 rounded-full" :class="p.importance === 'must' ? 'bg-error' : p.importance === 'recommended' ? 'bg-primary' : 'bg-(--ui-border-accented)'" :title="IMPORTANCE[p.importance].label" />
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </UCard>

          <UButton v-if="writable" label="この案を削除" icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" class="self-start" @click="deleteOpen = true" />
        </div>

        <div class="flex min-w-0 flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-semibold text-highlighted">
              プレビュー
            </p>
            <span class="text-xs text-muted">メニューを押すと画面イメージが切り替わります</span>
            <UButton
              class="ms-auto hidden lg:inline-flex"
              :label="wide ? '設定欄を表示' : 'プレビューを広げる'"
              :icon="wide ? 'i-lucide-panel-left-open' : 'i-lucide-maximize-2'"
              size="sm"
              color="neutral"
              variant="ghost"
              @click="wide = !wide"
            />
            <UButton
              :label="myVote === current.id ? '推し案に投票済み' : 'この案に投票'"
              :icon="'i-lucide-thumbs-up'"
              size="sm"
              :color="myVote === current.id ? 'primary' : 'neutral'"
              :variant="myVote === current.id ? 'soft' : 'outline'"
              :disabled="!state.myId"
              @click="toggleVote(current.id)"
            />
          </div>
          <ScreenEditor
            v-if="screenSpec && screenPattern"
            :spec="screenSpec"
            :choice="current.screens?.[screenPattern.id]"
            :name="screenPattern.name"
            :disabled="!writable"
            @change="setScreen"
          />
          <BuilderPreview :key="current.id" v-model:screen="screenId" :candidate="current" height="44rem" />
        </div>
      </div>

      <!-- 比較 -->
      <div v-else-if="view === 'compare'" class="overflow-x-auto rounded-lg border border-default">
        <table class="w-full min-w-[40rem] text-sm">
          <thead class="sticky top-0 bg-default">
            <tr class="border-b border-default">
              <th class="w-72 px-4 py-3 text-left text-xs font-medium text-muted">
                機能
              </th>
              <th v-for="c in state.candidates" :key="c.id" class="px-3 py-3 text-center">
                <button type="button" class="inline-flex flex-col items-center gap-1" @click="selectedId = c.id; view = 'edit'">
                  <span class="flex items-center gap-1.5 font-semibold text-highlighted">
                    <span class="size-2 rounded-full" :style="{ background: `var(--color-${c.settings.color}-500)` }" />{{ c.name }}
                  </span>
                  <UBadge :label="CANDIDATE_STATUS[c.status].label" :color="CANDIDATE_STATUS[c.status].color" variant="subtle" size="sm" />
                </button>
              </th>
            </tr>
            <tr class="border-b border-default bg-elevated/40 text-xs">
              <td class="px-4 py-2 text-muted">
                機能数 / 推し
              </td>
              <td v-for="c in state.candidates" :key="c.id" class="px-3 py-2 text-center tabular-nums">
                <span class="font-semibold text-highlighted">{{ c.patterns.length }}</span>
                <span class="text-muted"> ・ </span>
                <button type="button" class="inline-flex items-center gap-0.5" :class="myVote === c.id ? 'text-primary' : 'text-muted'" :disabled="!state.myId" :aria-label="`${c.name}に投票`" @click="toggleVote(c.id)">
                  <UIcon name="i-lucide-thumbs-up" class="size-3.5" />{{ voteCounts[c.id] ?? 0 }}
                </button>
              </td>
            </tr>
          </thead>
          <tbody>
            <template v-for="cat in compareRows" :key="cat.id">
              <tr class="bg-elevated/25">
                <td :colspan="state.candidates.length + 1" class="px-4 py-1.5 text-xs font-semibold text-toned">
                  <UIcon :name="cat.icon" class="me-1 size-3.5 align-[-2px]" />{{ cat.label }}
                </td>
              </tr>
              <tr v-for="p in cat.rows" :key="p.id" class="border-t border-default">
                <td class="px-4 py-2">
                  <span class="text-highlighted">{{ p.name }}</span>
                  <UBadge v-if="p.importance === 'must'" label="必須" color="error" variant="subtle" size="sm" class="ms-1.5" />
                </td>
                <td v-for="c in state.candidates" :key="c.id" class="px-3 py-2 text-center">
                  <UIcon
                    :name="c.patterns.includes(p.id) ? 'i-lucide-check' : 'i-lucide-minus'"
                    :class="c.patterns.includes(p.id) ? 'size-4 text-primary' : 'size-4 text-dimmed'"
                    :aria-label="c.patterns.includes(p.id) ? 'あり' : 'なし'"
                  />
                  <UTooltip v-if="c.patterns.includes(p.id) && screenSummary(c, p.id).customized" :text="screenSummary(c, p.id).blocks.join('・')">
                    <span class="block text-[10px] text-muted">{{ screenSummary(c, p.id).layout }}・{{ screenSummary(c, p.id).blocks.length }} 項目</span>
                  </UTooltip>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 発表 -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm text-muted">
              {{ state.candidates.findIndex(c => c.id === current!.id) + 1 }} / {{ state.candidates.length }} 案目
            </p>
            <h3 class="text-xl font-semibold text-highlighted">
              {{ current.name }}
            </h3>
            <p v-if="current.memo" class="mt-1 max-w-3xl text-sm text-default">
              {{ current.memo }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="outline"
              aria-label="前の案"
              :disabled="state.candidates.findIndex(c => c.id === current!.id) <= 0"
              @click="selectedId = state.candidates[state.candidates.findIndex(c => c.id === current!.id) - 1]?.id"
            />
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="outline"
              aria-label="次の案"
              :disabled="state.candidates.findIndex(c => c.id === current!.id) >= state.candidates.length - 1"
              @click="selectedId = state.candidates[state.candidates.findIndex(c => c.id === current!.id) + 1]?.id"
            />
            <UButton
              :label="myVote === current.id ? `投票済み（${voteCounts[current.id] ?? 0}）` : `この案に投票（${voteCounts[current.id] ?? 0}）`"
              icon="i-lucide-thumbs-up"
              :color="myVote === current.id ? 'primary' : 'neutral'"
              :variant="myVote === current.id ? 'solid' : 'outline'"
              :disabled="!state.myId"
              @click="toggleVote(current.id)"
            />
          </div>
        </div>
        <BuilderPreview :key="`p-${current.id}`" v-model:screen="screenId" :candidate="current" height="44rem" />
      </div>
    </template>

    <UModal v-model:open="deleteOpen" :title="`「${current?.name}」を削除しますか？`" description="共有している全員の画面から消えます。元に戻せません。">
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="キャンセル" color="neutral" variant="ghost" @click="deleteOpen = false" />
          <UButton label="削除する" color="error" @click="confirmDelete" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="textOpen" title="全案の内容（テキスト）" description="選択して資料や依頼文に貼り付けてください">
      <template #body>
        <UTextarea :model-value="summaryText" readonly :rows="18" class="w-full font-mono text-xs" aria-label="全案の内容" />
      </template>
    </UModal>
  </div>
</template>
