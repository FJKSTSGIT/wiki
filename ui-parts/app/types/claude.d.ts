// claude.ai の公開ページで使えるランタイム機能（共有 DB など）。ローカル実行時は存在しない。
export {}

declare global {
  interface Window {
    claude?: { use: (name: string) => Promise<any | null> }
  }
}
