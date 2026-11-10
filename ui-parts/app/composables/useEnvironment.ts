import { ENVIRONMENTS, type EnvKey } from '~/utils/environments'

/** 現在の接続先環境（サンプル）。本番では runtimeConfig などビルド時の設定から決める */
export function useEnvironment() {
  const env = useState<EnvKey>('env', () => 'production')
  const meta = computed(() => ENVIRONMENTS[env.value])
  return { env, meta }
}
