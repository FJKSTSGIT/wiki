/**
 * ゲーム系管理ツールでよく使われる画面・機能パターンの一覧
 * 「パターン一覧」画面で選択し、必要な構成を決めるための元データ。
 */
export type Importance = 'must' | 'recommended' | 'optional'

export interface Pattern {
  id: string
  name: string
  description: string
  /** 主に使う UI 部品（Nuxt UI の部品名・このカタログの部品名） */
  ui: string[]
  importance: Importance
  /** このカタログ / モックで画面イメージを確認できる場所 */
  sample?: { label: string, to?: string }
}

export interface PatternCategory {
  id: string
  label: string
  icon: string
  description: string
  patterns: Pattern[]
}

export const IMPORTANCE: Record<Importance, { label: string, color: 'error' | 'primary' | 'neutral' }> = {
  must: { label: 'ほぼ必須', color: 'error' },
  recommended: { label: '推奨', color: 'primary' },
  optional: { label: '必要に応じて', color: 'neutral' }
}

const MOCK = '管理ツールモック'

export const PATTERN_CATEGORIES: PatternCategory[] = [
  {
    id: 'foundation',
    label: '共通基盤',
    icon: 'i-lucide-layers',
    description: 'すべての画面の土台になる仕組み',
    patterns: [
      { id: 'login', name: 'ログイン・シングルサインオン', description: '社内アカウント（Google / Microsoft など）でログイン。2 段階認証', ui: ['Form', 'Card'], importance: 'must' },
      { id: 'side-menu', name: 'サイドメニュー', description: '機能ごとの画面切替。折りたたみ・スマホ対応', ui: ['SideMenu', 'NavigationMenu'], importance: 'must', sample: { label: '部品：サイドメニュー', to: '/parts/side-menu' } },
      { id: 'env-header', name: '接続先環境の表示', description: '本番・ステージングなどを色で常時表示し、誤操作を防ぐ', ui: ['EnvHeader', 'Badge'], importance: 'must', sample: { label: '部品：固定ヘッダー', to: '/parts/env-header' } },
      { id: 'rbac', name: '権限管理', description: 'スタッフごとに見られる画面・できる操作を設定', ui: ['AccessGuard', 'Table', 'Checkbox'], importance: 'must', sample: { label: '部品：権限による表示切替', to: '/parts/access' } },
      { id: 'staff', name: 'スタッフ（管理ツール利用者）管理', description: '招待・停止・所属や役割の管理', ui: ['Table', 'Modal', 'Form'], importance: 'must', sample: { label: MOCK } },
      { id: 'audit', name: '操作ログ（監査ログ）', description: '誰が・いつ・何をしたかの記録と検索', ui: ['Table', 'Badge'], importance: 'must', sample: { label: MOCK } },
      { id: 'approval', name: '承認フロー（ダブルチェック）', description: '配布・ガチャ公開など重要操作を別の人が承認してから実行', ui: ['Timeline', 'Modal', 'Badge'], importance: 'recommended' },
      { id: 'schedule-job', name: '予約実行・ジョブ管理', description: '日時指定で反映する処理の一覧、実行状況、取り消し', ui: ['Table', 'Progress', 'Badge'], importance: 'recommended' },
      { id: 'csv', name: 'CSV 出力・取り込み', description: '一覧の CSV ダウンロード、一括登録用の取り込み', ui: ['Button', 'FileUpload'], importance: 'must', sample: { label: MOCK } },
      { id: 'chat-notify', name: 'チャット通知連携', description: '重要操作やエラーを Slack などに通知', ui: ['Form', 'Switch'], importance: 'optional' }
    ]
  },
  {
    id: 'dashboard',
    label: 'ダッシュボード・分析',
    icon: 'i-lucide-chart-line',
    description: 'サービスの状況を数字で把握する',
    patterns: [
      { id: 'kpi', name: 'KPI ダッシュボード', description: 'DAU・新規・売上・課金率・ARPPU などの推移', ui: ['Card', 'Chart'], importance: 'must', sample: { label: MOCK } },
      { id: 'realtime', name: 'リアルタイム状況', description: '同時接続数・直近の売上・エラー件数', ui: ['Chart', 'Badge'], importance: 'recommended' },
      { id: 'retention', name: '継続率（リテンション）', description: '登録日ごとの翌日・7 日後・30 日後の継続率', ui: ['Table（ヒートマップ）'], importance: 'recommended' },
      { id: 'sales-report', name: '売上レポート', description: '日別・商品別・OS 別の売上と前年比', ui: ['Table', 'Chart'], importance: 'must' },
      { id: 'event-report', name: 'イベント・ガチャ効果測定', description: '施策ごとの参加率・売上への影響', ui: ['Chart', 'Table'], importance: 'recommended' },
      { id: 'funnel', name: 'チュートリアル離脱（ファネル）', description: '初回プレイのどこで離脱しているか', ui: ['Chart'], importance: 'optional' }
    ]
  },
  {
    id: 'player',
    label: 'プレイヤー（ユーザー情報）',
    icon: 'i-lucide-gamepad-2',
    description: 'プレイヤー個人の調査と対応',
    patterns: [
      { id: 'player-search', name: 'プレイヤー検索', description: 'ID・名前・引き継ぎコード・端末 ID などで検索', ui: ['Input', 'Table'], importance: 'must', sample: { label: MOCK } },
      { id: 'player-detail', name: 'プレイヤー詳細', description: 'プロフィール・レベル・所持通貨・最終ログインなど', ui: ['Card', 'Tabs'], importance: 'must', sample: { label: MOCK } },
      { id: 'inventory', name: '所持品・所持通貨の確認', description: 'キャラ・アイテム・有償 / 無償通貨の内訳', ui: ['Table', 'Tabs'], importance: 'must' },
      { id: 'grant', name: '付与・剥奪', description: '個別にアイテムや通貨を付与 / 回収（理由の記録つき）', ui: ['Form', 'Modal'], importance: 'must' },
      { id: 'ban', name: 'アカウント停止（BAN）', description: '期間指定の停止・解除、停止理由の管理', ui: ['Modal', 'Badge'], importance: 'must', sample: { label: MOCK } },
      { id: 'account-recovery', name: '引き継ぎ・アカウント復旧', description: '機種変更時のデータ移行サポート、本人確認の記録', ui: ['Form', 'Timeline'], importance: 'recommended' },
      { id: 'player-log', name: '行動ログ', description: 'ログイン・課金・ガチャ・アイテム増減の履歴', ui: ['Table', 'Timeline'], importance: 'must' },
      { id: 'device', name: '端末・接続情報', description: 'OS・アプリのバージョン・端末の履歴', ui: ['Table'], importance: 'optional' },
      { id: 'name-moderation', name: '名前・自己紹介の審査', description: '不適切な名前の一覧と強制変更', ui: ['Table', 'Modal'], importance: 'recommended' }
    ]
  },
  {
    id: 'master',
    label: 'マスタデータ',
    icon: 'i-lucide-database',
    description: 'キャラ・アイテム・クエストなどゲームの設定データ',
    patterns: [
      { id: 'master-list', name: 'マスタ一覧・編集', description: 'キャラ・アイテム・クエスト・敵などのテーブル編集', ui: ['Table', 'Form', 'Slideover'], importance: 'must' },
      { id: 'master-import', name: '表計算ファイルから一括取り込み', description: '企画が作った Excel / スプレッドシートを取り込み', ui: ['FileUpload', 'Table（取込プレビュー）'], importance: 'must' },
      { id: 'master-validate', name: '入力チェック', description: '参照切れ・数値範囲・必須項目のエラーを一覧表示', ui: ['Alert', 'Table'], importance: 'must' },
      { id: 'master-diff', name: '差分確認・バージョン管理', description: '前回との変更点を色付きで確認、過去版に戻す', ui: ['Table（差分）', 'Timeline'], importance: 'must' },
      { id: 'master-promote', name: '環境間の反映', description: 'ステージングで確認したマスタを本番へ反映', ui: ['Stepper', 'Modal'], importance: 'recommended' },
      { id: 'master-schedule', name: '公開予約', description: '新キャラ・新ステージを指定日時に公開', ui: ['Form', 'Calendar'], importance: 'recommended' },
      { id: 'asset', name: '画像・アセット管理', description: 'バナー・アイコン画像のアップロードと配信', ui: ['FileUpload', 'Card'], importance: 'optional' }
    ]
  },
  {
    id: 'gacha',
    label: '抽選（ガチャ）',
    icon: 'i-lucide-sparkles',
    description: '抽選の設定・検証・確率表示',
    patterns: [
      { id: 'gacha-list', name: 'ガチャ一覧・スケジュール', description: '開催中・予定・終了のガチャを期間とともに一覧', ui: ['Table', 'Calendar', 'Badge'], importance: 'must' },
      { id: 'gacha-setting', name: 'ガチャ設定', description: '期間・消費通貨・回数・バナー・ピックアップ対象', ui: ['Form', 'Tabs'], importance: 'must' },
      { id: 'gacha-table', name: '排出テーブル（提供割合）設定', description: 'レアリティ・キャラごとの確率。合計 100% チェック', ui: ['Table（編集）', 'Progress'], importance: 'must' },
      { id: 'gacha-pity', name: '天井・ステップアップ・確定枠', description: '回数による確定や段階ごとの確率変更', ui: ['Form', 'Stepper'], importance: 'recommended' },
      { id: 'gacha-rate-display', name: '確率表示の確認', description: 'プレイヤーに見せる提供割合表示のプレビュー', ui: ['Card（プレビュー）'], importance: 'must' },
      { id: 'gacha-sim', name: '抽選シミュレーション', description: '設定どおりの確率で排出されるかを大量試行で確認', ui: ['Chart', 'Table'], importance: 'recommended' },
      { id: 'gacha-log', name: '抽選履歴・排出ログ', description: 'プレイヤーごと・ガチャごとの排出結果の確認（問い合わせ対応）', ui: ['Table'], importance: 'must' },
      { id: 'gacha-audit', name: '実績確率の集計', description: '実際の排出率と設定確率の比較（監査用）', ui: ['Table', 'Chart'], importance: 'recommended' }
    ]
  },
  {
    id: 'liveops',
    label: 'イベント・運営施策',
    icon: 'i-lucide-calendar-range',
    description: '期間限定の施策の設定と管理',
    patterns: [
      { id: 'event-calendar', name: '施策カレンダー', description: 'イベント・ガチャ・キャンペーンの予定を一覧で確認', ui: ['Calendar', 'Badge'], importance: 'must' },
      { id: 'event-setting', name: 'イベント設定', description: '期間・報酬・参加条件・ステージの紐付け', ui: ['Form', 'Tabs'], importance: 'must' },
      { id: 'login-bonus', name: 'ログインボーナス', description: '日数ごとの報酬設定', ui: ['Table（編集）'], importance: 'recommended' },
      { id: 'mission', name: 'ミッション設定', description: 'デイリー・ウィークリー・イベントミッション', ui: ['Table', 'Form'], importance: 'recommended' },
      { id: 'ranking', name: 'ランキング管理', description: '順位の確認・不正者の除外・順位報酬の配布', ui: ['Table', 'Modal'], importance: 'recommended' },
      { id: 'shop', name: 'ゲーム内ショップ・セール', description: '期間限定商品・割引・購入回数制限', ui: ['Table', 'Form'], importance: 'recommended' }
    ]
  },
  {
    id: 'reward',
    label: '配布・報酬',
    icon: 'i-lucide-gift',
    description: 'プレイヤーへのアイテム配布',
    patterns: [
      { id: 'present-bulk', name: '一括配布（プレゼントボックス）', description: '全員または条件指定でアイテムを配布。受取期限つき', ui: ['Form', 'Stepper', 'Modal'], importance: 'must' },
      { id: 'apology', name: 'お詫び配布', description: '障害・不具合時の補填。対象者の抽出と配布', ui: ['Form', 'Table'], importance: 'must' },
      { id: 'serial', name: 'シリアルコード', description: 'コードの発行・配布状況・利用状況', ui: ['Table', 'Form'], importance: 'recommended' },
      { id: 'reward-history', name: '配布履歴', description: '過去の配布内容・対象人数・取り消し', ui: ['Table'], importance: 'must' }
    ]
  },
  {
    id: 'communication',
    label: 'お知らせ・告知',
    icon: 'i-lucide-megaphone',
    description: 'プレイヤーへの情報発信',
    patterns: [
      { id: 'notice', name: 'ゲーム内お知らせ', description: '種別・掲載期間・対象・表示方法の設定とプレビュー', ui: ['NoticeSettings', 'Form'], importance: 'must', sample: { label: '部品：お知らせ設定', to: '/parts/notice' } },
      { id: 'push', name: 'プッシュ通知配信', description: '対象・日時を指定して端末に通知', ui: ['Form', 'Calendar'], importance: 'recommended', sample: { label: '部品：お知らせ設定', to: '/parts/notice' } },
      { id: 'banner', name: 'バナー管理', description: 'ホーム画面のバナーの画像・リンク・表示順', ui: ['Card', 'FileUpload'], importance: 'recommended' },
      { id: 'maintenance', name: 'メンテナンス設定', description: 'メンテ中表示の切替・予定時刻・接続を許可する端末', ui: ['Switch', 'Form', 'Alert'], importance: 'must' }
    ]
  },
  {
    id: 'billing',
    label: '課金・ストア',
    icon: 'i-lucide-receipt-japanese-yen',
    description: 'アプリ内課金の管理',
    patterns: [
      { id: 'purchases', name: '課金履歴', description: '取引ごとの記録。ストアの取引 ID で検索', ui: ['Table'], importance: 'must', sample: { label: MOCK } },
      { id: 'refund', name: '返金対応', description: '返金の記録と付与済みアイテムの回収', ui: ['Modal', 'Form'], importance: 'must', sample: { label: MOCK } },
      { id: 'products', name: 'ストア商品管理', description: '商品 ID・価格帯・販売期間', ui: ['Table', 'Form'], importance: 'must' },
      { id: 'currency-balance', name: '有償・無償通貨の残高', description: '前払式支払手段の残高集計（法定の報告用）', ui: ['Table', 'Card'], importance: 'must' },
      { id: 'age-limit', name: '年齢別の課金上限', description: '未成年の月額上限の設定と確認', ui: ['Form', 'Table'], importance: 'recommended' }
    ]
  },
  {
    id: 'support',
    label: 'カスタマーサポート',
    icon: 'i-lucide-headset',
    description: '問い合わせ対応',
    patterns: [
      { id: 'inquiry', name: '問い合わせ管理', description: '受付・担当者・対応状況の管理', ui: ['Table', 'Badge'], importance: 'recommended' },
      { id: 'inquiry-thread', name: '対応履歴・メモ', description: 'プレイヤーごとの対応記録を残す', ui: ['Timeline', 'Textarea'], importance: 'recommended' },
      { id: 'reply-template', name: '返信テンプレート', description: 'よくある質問への定型文', ui: ['Table', 'Form'], importance: 'optional' }
    ]
  },
  {
    id: 'ops',
    label: '運用・システム',
    icon: 'i-lucide-server-cog',
    description: 'アプリとサーバーの運用設定',
    patterns: [
      { id: 'app-version', name: 'アプリのバージョン管理', description: '強制アップデートの対象バージョン・ストアへの誘導', ui: ['Table', 'Form'], importance: 'must' },
      { id: 'feature-flag', name: '機能の ON / OFF', description: '不具合時に機能だけ止める、段階的に公開する', ui: ['Switch', 'Table'], importance: 'recommended' },
      { id: 'ab-test', name: 'A/B テスト', description: 'プレイヤーを振り分けて施策を比較', ui: ['Form', 'Chart'], importance: 'optional' },
      { id: 'ng-word', name: 'NG ワード管理', description: '名前・チャットで使えない言葉の登録', ui: ['Table', 'Form'], importance: 'recommended' },
      { id: 'server-status', name: 'サーバー状態', description: 'API・DB の稼働状況とエラー率', ui: ['Card', 'Chart', 'Badge'], importance: 'optional' }
    ]
  },
  {
    id: 'security',
    label: '不正対策',
    icon: 'i-lucide-shield-alert',
    description: 'チート・不正利用への対応',
    patterns: [
      { id: 'cheat-detect', name: '不正の疑い一覧', description: '異常なスコア・通貨の急増などを検知して一覧化', ui: ['Table', 'Badge'], importance: 'recommended' },
      { id: 'cheat-rule', name: '検知ルール設定', description: 'しきい値や条件の設定', ui: ['Form', 'Table'], importance: 'optional' },
      { id: 'ip-block', name: 'IP・端末の制限', description: '特定の端末や接続元からのアクセスを拒否', ui: ['Table', 'Form'], importance: 'optional' }
    ]
  }
]

export const ALL_PATTERNS = PATTERN_CATEGORIES.flatMap(c => c.patterns.map(p => ({ ...p, categoryId: c.id })))

/** 選択のプリセット */
export const PATTERN_PRESETS = [
  { id: 'min', label: '最小構成', description: '「ほぼ必須」のみ', ids: ALL_PATTERNS.filter(p => p.importance === 'must').map(p => p.id) },
  { id: 'standard', label: '標準構成', description: '「ほぼ必須」＋「推奨」', ids: ALL_PATTERNS.filter(p => p.importance !== 'optional').map(p => p.id) },
  { id: 'all', label: 'すべて', description: '全パターン', ids: ALL_PATTERNS.map(p => p.id) }
]
