/**
 * 管理ツール組み立て（ビルダー）の状態管理
 *
 * - claude.ai で公開したページでは「共有 DB」に保存し、全員の変更がリアルタイムに反映される
 *   （candidates コレクション = 候補案、votes/<ユーザーID> = 各自の推し案）
 * - 誰がどの案を見ているかは room（同時接続）で共有
 * - ローカルで動かしたときや共有に接続できないときは、このブラウザだけに保存する
 */
import type { EnvKey } from '~/utils/environments'
import { PATTERN_PRESETS } from '~/utils/patterns'
import type { ScreenChoice } from '~/utils/screens'

export type CandidateStatus = 'draft' | 'review' | 'adopted' | 'rejected'
export type CandidateLayout = 'sidebar' | 'compact' | 'topnav'

export interface CandidateSettings {
  productName: string
  color: string
  env: EnvKey
  layout: CandidateLayout
}

export interface Candidate {
  id: string
  name: string
  memo: string
  status: CandidateStatus
  order: number
  patterns: string[]
  settings: CandidateSettings
  /** 画面ごとのレイアウト・表示項目の選択（パターン ID → 選択） */
  screens?: Record<string, ScreenChoice>
  updatedAt: number
  updatedBy: string | null
}

export const CANDIDATE_STATUS: Record<CandidateStatus, { label: string, color: 'neutral' | 'info' | 'success' | 'error' }> = {
  draft: { label: '検討中', color: 'neutral' },
  review: { label: '提案中', color: 'info' },
  adopted: { label: '採用', color: 'success' },
  rejected: { label: '見送り', color: 'error' }
}

export const CANDIDATE_COLORS = ['indigo', 'blue', 'emerald', 'teal', 'amber', 'orange', 'rose', 'violet', 'slate'] as const

export const CANDIDATE_LAYOUTS: { value: CandidateLayout, label: string, description: string }[] = [
  { value: 'sidebar', label: 'サイドメニュー', description: '左に機能一覧（標準）' },
  { value: 'compact', label: 'アイコンのみ', description: '左メニューを折りたたみ、画面を広く使う' },
  { value: 'topnav', label: '上部メニュー', description: '分類を上部に並べる（機能が少ない場合）' }
]

type BuilderMode = 'connecting' | 'shared' | 'local'

interface PeerInfo {
  peer: string
  by: string | null
  isMe: boolean
  candidateId?: string
}

const LOCAL_KEY = 'ui-parts:builder'

/** 新しい案の初期値 */
export function newCandidateBody(name: string, patterns: string[], order: number, base?: Partial<Candidate>): Omit<Candidate, 'id'> {
  return {
    name,
    memo: base?.memo ?? '',
    status: 'draft',
    order,
    patterns: [...patterns],
    settings: { productName: 'Game Admin', color: 'indigo', env: 'production', layout: 'sidebar', ...base?.settings },
    screens: base?.screens ? JSON.parse(JSON.stringify(base.screens)) : {},
    updatedAt: Date.now(),
    updatedBy: null
  }
}

function localSamples(): Candidate[] {
  const min = PATTERN_PRESETS.find(p => p.id === 'min')!.ids
  const std = PATTERN_PRESETS.find(p => p.id === 'standard')!.ids
  return [
    { id: 'local-a', ...newCandidateBody('案A：最小構成', min, 1, { memo: 'まずは必須機能だけで早くリリースする案', settings: { productName: 'Game Admin', color: 'indigo', env: 'production', layout: 'sidebar' } }) },
    { id: 'local-b', ...newCandidateBody('案B：標準構成', std, 2, { memo: '運営に必要な機能を一通りそろえる案', settings: { productName: 'Game Admin', color: 'emerald', env: 'staging', layout: 'compact' } }) }
  ]
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

function mergeDeep(target: any, patch: any) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') mergeDeep(target[k], v)
    else target[k] = v
  }
  return target
}

// ---- モジュール内で 1 つだけ持つ状態（ページを移動しても接続を維持） ----
const state = reactive({
  mode: 'connecting' as BuilderMode,
  notice: '',
  candidates: [] as Candidate[],
  votes: {} as Record<string, string>,
  myId: null as string | null,
  canWrite: true,
  peers: [] as PeerInfo[],
  names: {} as Record<string, string>
})

let started = false
let db: any = null
let userApi: any = null
let room: any = null
/** 書き込み待ちの差分（ドキュメントごとに 1 本ずつ直列に送る） */
const pending = new Map<string, Record<string, unknown>>()
const flushing = new Set<string>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function saveLocal() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ candidates: state.candidates, votes: state.votes }))
  } catch { /* 保存できなくても動作は続ける */ }
}

function startLocal(notice = '') {
  state.mode = 'local'
  state.notice = notice
  state.myId = 'local-me'
  state.canWrite = true
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      state.candidates = data.candidates ?? []
      state.votes = data.votes ?? {}
      return
    }
  } catch { /* 無視 */ }
  state.candidates = localSamples()
}

function applySnapshot(docs: { id: string, data(): any }[]) {
  state.candidates = docs
    .map((d) => {
      const c = { id: d.id, ...clone(d.data()) } as Candidate
      const p = pending.get(d.id)
      return p ? mergeDeep(c, clone(p)) : c
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
}

async function resolveNames(ids: (string | null | undefined)[]) {
  if (!userApi?.profiles) return
  const unique = [...new Set(ids.filter((v): v is string => !!v))]
  if (!unique.length) return
  try {
    const ps = await userApi.profiles(unique)
    for (const id of unique) state.names[id] = ps?.[id]?.name || ''
  } catch { /* 名前が取れなくても表示は続ける */ }
}

async function init() {
  if (started || import.meta.server) return
  started = true
  const claude = window.claude
  if (!claude?.use) return startLocal()

  const timer = setTimeout(() => {
    if (state.mode === 'connecting') startLocal('共有データに接続できなかったため、このブラウザだけに保存しています。')
  }, 10000)

  db = await claude.use('db')
  if (!db) {
    clearTimeout(timer)
    return startLocal('このページでは共有保存が使えないため、このブラウザだけに保存しています。')
  }

  userApi = await claude.use('user')
  state.myId = (await userApi?.id?.()) ?? null
  const writable = await userApi?.can?.('data.write')
  state.canWrite = writable !== false

  db.collection('candidates').onSnapshot((snap: any) => {
    if (state.mode === 'local') return
    applySnapshot(snap.docs.filter((d: any) => d.exists))
    if (!snap.metadata.fromCache) {
      clearTimeout(timer)
      state.mode = 'shared'
      state.notice = ''
    }
    resolveNames(state.candidates.map(c => c.updatedBy))
  }, () => {
    clearTimeout(timer)
    if (state.mode === 'connecting') startLocal('共有データを読み込めなかったため、このブラウザだけに保存しています。')
  })

  db.collection('votes').onSnapshot((snap: any) => {
    const votes: Record<string, string> = {}
    for (const d of snap.docs) {
      const v = d.data()
      if (d.exists && typeof v?.candidateId === 'string') votes[d.id] = v.candidateId
    }
    state.votes = votes
    resolveNames(Object.keys(votes))
  })

  room = await claude.use('room')
  if (room) {
    room.onPeers((change: any) => {
      state.peers = change.peers
        .filter((p: any) => p.kind === 'viewer')
        .map((p: any) => ({ peer: p.peer, by: p.by, isMe: p.isMe, candidateId: typeof p.presence?.candidateId === 'string' ? p.presence.candidateId : undefined }))
      resolveNames(state.peers.map(p => p.by))
    })
  }
}

function markReadOnly() {
  state.canWrite = false
  state.notice = '閲覧のみの権限のため、変更は保存されません。'
}

async function flush(id: string) {
  if (flushing.has(id)) return
  const patch = pending.get(id)
  if (!patch) return
  pending.delete(id)
  flushing.add(id)
  try {
    await db.doc(`candidates/${id}`).update(patch)
  } catch (e: any) {
    if (e?.code === 'invalid_argument') markReadOnly()
    else state.notice = '保存に失敗しました。少し待ってからもう一度操作してください。'
  } finally {
    flushing.delete(id)
    if (pending.has(id)) flush(id)
  }
}

export function useBuilder() {
  onMounted(init)

  const writable = computed(() => state.canWrite)

  function updateCandidate(id: string, patch: Partial<Omit<Candidate, 'id'>>, delay = 400) {
    if (!state.canWrite) return
    const c = state.candidates.find(x => x.id === id)
    if (!c) return
    const full = { ...clone(patch), updatedAt: Date.now(), updatedBy: state.myId }
    mergeDeep(c, clone(full))

    if (state.mode !== 'shared') return saveLocal()
    pending.set(id, mergeDeep(pending.get(id) ?? {}, full))
    clearTimeout(timers.get(id))
    timers.set(id, setTimeout(() => flush(id), delay))
  }

  async function createCandidate(name: string, patterns: string[], base?: Partial<Candidate>) {
    if (!state.canWrite) return
    const order = Math.max(0, ...state.candidates.map(c => c.order ?? 0)) + 1
    const body = { ...newCandidateBody(name, patterns, order, base), updatedBy: state.myId }
    if (state.mode !== 'shared') {
      const c = { id: `local-${Date.now()}`, ...body }
      state.candidates.push(c)
      saveLocal()
      return c.id
    }
    try {
      const ref = db.collection('candidates').doc()
      await ref.set(body)
      return ref.id as string
    } catch (e: any) {
      if (e?.code === 'invalid_argument') markReadOnly()
      else if (e?.code === 'quota_exceeded') state.notice = '保存できる案の上限に達しました。不要な案を削除してください。'
      return undefined
    }
  }

  async function deleteCandidate(id: string) {
    if (!state.canWrite) return
    state.candidates = state.candidates.filter(c => c.id !== id)
    if (state.mode !== 'shared') return saveLocal()
    pending.delete(id)
    try {
      await db.doc(`candidates/${id}`).delete()
    } catch (e: any) {
      if (e?.code === 'invalid_argument') markReadOnly()
    }
  }

  async function vote(candidateId: string | null) {
    const me = state.myId
    if (!me) return
    if (candidateId) state.votes = { ...state.votes, [me]: candidateId }
    else {
      const { [me]: _, ...rest } = state.votes
      state.votes = rest
    }
    if (state.mode !== 'shared') return saveLocal()
    try {
      if (candidateId) await db.doc(`votes/${me}`).set({ candidateId, at: Date.now() })
      else await db.doc(`votes/${me}`).delete()
    } catch { /* 投票できない権限の場合は表示のみ */ }
  }

  function setPresence(candidateId: string | undefined) {
    room?.presence({ candidateId: candidateId ?? null }).catch(() => {})
  }

  function nameOf(id: string | null | undefined) {
    if (!id) return ''
    if (id === state.myId) return 'あなた'
    return state.names[id] || 'メンバー'
  }

  const voteCounts = computed(() => {
    const counts: Record<string, number> = {}
    for (const cid of Object.values(state.votes)) counts[cid] = (counts[cid] ?? 0) + 1
    return counts
  })

  return {
    state: state as Readonly<typeof state>,
    writable,
    voteCounts,
    updateCandidate,
    createCandidate,
    deleteCandidate,
    vote,
    setPresence,
    nameOf
  }
}
