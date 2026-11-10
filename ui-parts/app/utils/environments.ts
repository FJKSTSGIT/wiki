/**
 * 接続先環境の定義
 * 色・ラベル・注意文をここで一元管理する。Tailwind が検出できるよう class は完全な文字列で書く。
 */
export type EnvKey = 'production' | 'staging' | 'development' | 'local'

export interface EnvMeta {
  label: string
  short: string
  icon: string
  color: 'error' | 'warning' | 'info' | 'neutral'
  description: string
  /** ヘッダー上端のライン */
  stripe: string
  /** ヘッダー背景の色味 */
  tint: string
  /** 注意バナーを出すか */
  caution: boolean
}

export const ENVIRONMENTS: Record<EnvKey, EnvMeta> = {
  production: {
    label: '本番環境',
    short: 'PROD',
    icon: 'i-lucide-flame',
    color: 'error',
    description: '実際のプレイヤーデータに接続しています。操作は即時に反映されます。',
    stripe: 'bg-error',
    tint: 'bg-error/5',
    caution: true
  },
  staging: {
    label: 'ステージング',
    short: 'STG',
    icon: 'i-lucide-flask-conical',
    color: 'warning',
    description: 'リリース前の検証環境です。',
    stripe: 'bg-warning',
    tint: 'bg-warning/5',
    caution: false
  },
  development: {
    label: '開発環境',
    short: 'DEV',
    icon: 'i-lucide-code-xml',
    color: 'info',
    description: '開発用の環境です。データは定期的にリセットされます。',
    stripe: 'bg-info',
    tint: 'bg-info/5',
    caution: false
  },
  local: {
    label: 'ローカル',
    short: 'LOCAL',
    icon: 'i-lucide-laptop',
    color: 'neutral',
    description: '手元の PC で動いています。',
    stripe: 'bg-inverted/40',
    tint: '',
    caution: false
  }
}

export const ENV_KEYS = Object.keys(ENVIRONMENTS) as EnvKey[]
