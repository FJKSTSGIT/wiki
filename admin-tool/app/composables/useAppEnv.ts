export type AppEnv = 'local' | 'dev' | 'stg' | 'prod'

export interface EnvInfo {
  key: AppEnv
  label: string
  name: string
  creature: string
  creatureEn: string
  tagline: string
  badge: 'neutral' | 'info' | 'warning' | 'error'
}

export const ENVS: Record<AppEnv, EnvInfo> = {
  local: { key: 'local', label: 'LOCAL', name: 'ローカル', creature: '墓', creatureEn: 'Grave', tagline: 'ここで何が起きても誰も知らない', badge: 'neutral' },
  dev: { key: 'dev', label: 'DEV', name: '開発', creature: '卵', creatureEn: 'Egg', tagline: 'まだ殻の中。割れても大丈夫', badge: 'info' },
  stg: { key: 'stg', label: 'STG', name: 'ステージング', creature: '雛', creatureEn: 'Chick', tagline: '巣立ち前の最終チェック', badge: 'warning' },
  prod: { key: 'prod', label: 'PROD', name: '本番', creature: '鶏', creatureEn: 'Chicken', tagline: '本番環境。操作は慎重に', badge: 'error' }
}

export const ENV_KEYS = Object.keys(ENVS) as AppEnv[]

const isEnv = (v: unknown): v is AppEnv => typeof v === 'string' && v in ENVS

export function useAppEnv() {
  const config = useRuntimeConfig()
  const base: AppEnv = isEnv(config.public.appEnv) ? config.public.appEnv : 'local'
  // デモ用：見た目だけ他環境に切り替えられる（cookie 保存）
  const preview = useCookie<AppEnv | null>('env-preview', { default: () => null })
  const current = computed<AppEnv>(() => (isEnv(preview.value) ? preview.value : base))
  const info = computed(() => ENVS[current.value])
  const isPreviewing = computed(() => current.value !== base)
  return { base, preview, current, info, isPreviewing }
}
