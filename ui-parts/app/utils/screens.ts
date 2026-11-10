/**
 * 各画面（パターン）の中身の定義
 *
 * 画面は 4 つの型（一覧・詳細・入力・ダッシュボード）のどれかで、
 * 型ごとに選べるレイアウトと、オン / オフできる「ブロック（表示する項目のまとまり）」を持つ。
 * ブロックの data はプレビュー用の仮データ。
 */
export type ScreenType = 'list' | 'detail' | 'form' | 'dashboard'

type Color = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

export type Block =
  | { kind: 'filters', data: { search: string, items: string[] } }
  | { kind: 'table', data: { columns: string[], rows: string[][], status?: number, numeric?: number[] } }
  | { kind: 'kpis', data: { items: [string, string, string?][] } }
  | { kind: 'bars', data: { labels: string[], values: number[], unit?: string } }
  | { kind: 'line', data: { labels: string[], values: number[], compare?: number[] } }
  | { kind: 'kv', data: { items: [string, string][] } }
  | { kind: 'profile', data: { name: string, sub: string, badges: [string, Color][] } }
  | { kind: 'timeline', data: { items: [string, string, string?][] } }
  | { kind: 'form', data: { fields: Field[] } }
  | { kind: 'alert', data: { color: Color, title: string, text: string } }
  | { kind: 'rates', data: { rows: [string, string, number][] } }
  | { kind: 'calendar', data: { events: [number, number, string, Color][] } }
  | { kind: 'diff', data: { rows: [string, string, string, string][] } }
  | { kind: 'phone', data: { title: string, body: string, badge: string } }
  | { kind: 'upload', data: { text: string, file?: string } }
  | { kind: 'list', data: { items: [string, string, string?, Color?][] } }
  | { kind: 'heatmap', data: { rows: string[], cols: string[], values: number[][] } }

export interface Field {
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'switch' | 'radio' | 'checkbox'
  value?: string
  options?: string[]
  hint?: string
}

export type BlockDef = Block & { id: string, label: string, /** 初期状態でオフ */ off?: boolean }

export interface ScreenSpec {
  type: ScreenType
  actions?: [string, Color, string][]
  blocks: BlockDef[]
}

export const SCREEN_TYPES: Record<ScreenType, { label: string, layouts: { value: string, label: string, description: string, icon: string }[] }> = {
  list: {
    label: '一覧画面',
    layouts: [
      { value: 'table', label: '表', description: '1 行 1 件の表。件数が多い一覧向け', icon: 'i-lucide-table' },
      { value: 'split', label: '表＋詳細パネル', description: '行を選ぶと右に詳細。調べ物向け', icon: 'i-lucide-panel-right' },
      { value: 'cards', label: 'カード', description: '画像や状態を大きく見せたい一覧向け', icon: 'i-lucide-layout-grid' }
    ]
  },
  detail: {
    label: '詳細画面',
    layouts: [
      { value: 'tabs', label: 'タブ切替', description: '上に概要、下をタブで切り替える。項目が多い場合', icon: 'i-lucide-panels-top-left' },
      { value: 'columns', label: '2 カラム', description: '左に主な情報、右に補足。一目で全体を見たい場合', icon: 'i-lucide-columns-2' },
      { value: 'stacked', label: '縦に並べる', description: 'すべてを上から順に表示。スマホでも見やすい', icon: 'i-lucide-rows-3' }
    ]
  },
  form: {
    label: '入力・設定画面',
    layouts: [
      { value: 'single', label: '1 ページ', description: 'すべての項目を 1 画面で入力', icon: 'i-lucide-file-text' },
      { value: 'steps', label: '段階入力', description: '手順ごとに区切って入力し、最後に確認', icon: 'i-lucide-list-ordered' },
      { value: 'preview', label: '入力＋プレビュー', description: '右側で結果を確認しながら入力', icon: 'i-lucide-columns-2' }
    ]
  },
  dashboard: {
    label: 'ダッシュボード',
    layouts: [
      { value: 'grid', label: 'タイル', description: '指標とグラフを均等に並べる', icon: 'i-lucide-layout-dashboard' },
      { value: 'focus', label: 'グラフ中心', description: '主要なグラフを大きく表示', icon: 'i-lucide-chart-area' }
    ]
  }
}

/* ---------------- 共通の仮データ ---------------- */
const days = ['11/4', '11/5', '11/6', '11/7', '11/8', '11/9', '11/10']
const players = [
  ['P-100423', 'さくら99616', 'iOS', '128', '¥48,930', '5 分前', '有効'],
  ['P-100871', 'ShadowPro7', 'Android', '96', '¥0', '2 時間前', '有効'],
  ['P-101156', 'もち_jp722', 'iOS', '76', '¥12,400', '1 日前', '停止中'],
  ['P-102044', 'Nova_X', 'PC', '154', '¥210,000', '3 日前', '有効'],
  ['P-102513', 'ねこ759', 'Android', '8', '¥0', '45 日前', '休眠']
]
const staffRows = [
  ['佐藤 翔太', '運営部', '運営プランナー', '有効', '3 分前'],
  ['鈴木 美咲', 'CS 部', 'サポート', '有効', '1 時間前'],
  ['高橋 大輔', '開発部', '管理者', '有効', '昨日'],
  ['田中 彩', 'データ分析部', '閲覧のみ', '招待中', '—']
]
const gachaRows = [
  ['G-2031', '紅蓮の剣士 ピックアップ', '11/07〜11/21', 'ジェム 300', '開催中'],
  ['G-2032', 'ハロウィン限定', '10/24〜11/06', 'ジェム 300', '終了'],
  ['G-2033', '2 周年記念 ステップアップ', '11/22〜12/06', 'ジェム 300', '予定'],
  ['G-2034', 'チケット交換ガチャ', '常設', 'ガチャチケット', '開催中']
]

const f = (label: string, type: Field['type'], value?: string, options?: string[], hint?: string): Field => ({ label, type, value, options, hint })

/* ---------------- 画面ごとの定義 ---------------- */
export const SCREEN_SPECS: Record<string, ScreenSpec> = {
  /* 共通基盤 */
  'login': { type: 'form', actions: [['ログイン', 'primary', 'i-lucide-log-in']], blocks: [
    { id: 'sso', label: 'シングルサインオン', kind: 'list', data: { items: [['Google アカウントでログイン', '社内ドメインのみ'], ['Microsoft アカウントでログイン', '社内ドメインのみ']] } },
    { id: 'password', label: 'メール・パスワード', kind: 'form', data: { fields: [f('メールアドレス', 'text', 'taro@example.com'), f('パスワード', 'text', '••••••••')] }, off: true },
    { id: 'mfa', label: '2 段階認証', kind: 'form', data: { fields: [f('認証アプリの 6 桁コード', 'text', '123 456')] } },
    { id: 'notice', label: '注意文', kind: 'alert', data: { color: 'warning', title: '本番環境', text: 'ログイン操作はすべて記録されます。' } }
  ] },
  'side-menu': { type: 'detail', blocks: [
    { id: 'tree', label: 'メニュー構成', kind: 'list', data: { items: [['ダッシュボード', '全員'], ['プレイヤー', 'サポート以上'], ['ガチャ', 'プランナー以上'], ['システム設定', '管理者のみ']] } },
    { id: 'settings', label: '表示設定', kind: 'kv', data: { items: [['折りたたみ', 'あり'], ['スマホ表示', 'スライドメニュー'], ['件数バッジ', '未対応の問い合わせ数']] } }
  ] },
  'env-header': { type: 'detail', blocks: [
    { id: 'envs', label: '環境の一覧', kind: 'table', data: { columns: ['環境', '色', '注意表示', '接続先'], rows: [['本番', '赤', 'あり', 'api.game.example'], ['ステージング', '黄', 'なし', 'stg-api.game.example'], ['開発', '青', 'なし', 'dev-api.game.example']] } },
    { id: 'rule', label: '運用ルール', kind: 'alert', data: { color: 'info', title: '本番では色を変えない', text: '誤操作防止のため、本番環境の色は赤で固定します。' } }
  ] },
  'rbac': { type: 'detail', actions: [['変更を保存', 'primary', 'i-lucide-save']], blocks: [
    { id: 'profile', label: '対象ユーザー', kind: 'profile', data: { name: '鈴木 美咲', sub: 'CS 部・サポート', badges: [['テンプレート：サポート', 'info'], ['カスタム', 'warning']] } },
    { id: 'matrix', label: '権限の一覧', kind: 'table', data: { columns: ['機能', '閲覧', '編集', 'CSV 出力'], rows: [['プレイヤー', '○', '○', '—'], ['課金履歴', '○', '○（返金）', '—'], ['ガチャ', '○', '—', '—'], ['システム設定', '—', '—', '—']] } },
    { id: 'menu', label: '表示されるメニュー', kind: 'list', data: { items: [['ダッシュボード', '表示'], ['プレイヤー', '表示'], ['ガチャ', '表示'], ['システム設定', '非表示', '非表示', 'neutral']] } },
    { id: 'history', label: '変更履歴', kind: 'timeline', data: { items: [['11/08 14:02', '高橋 大輔 が「課金履歴：編集」を追加'], ['10/21 10:15', '高橋 大輔 がテンプレート「サポート」を適用']] } }
  ] },
  'staff': { type: 'list', actions: [['ユーザーを招待', 'primary', 'i-lucide-user-plus']], blocks: [
    { id: 'kpis', label: '件数', kind: 'kpis', data: { items: [['全ユーザー', '42'], ['招待中', '5'], ['2 段階認証 未設定', '11']] } },
    { id: 'filters', label: '検索・絞り込み', kind: 'filters', data: { search: '氏名・メールで検索', items: ['部署', '役割', 'ステータス'] } },
    { id: 'table', label: 'ユーザー一覧', kind: 'table', data: { columns: ['氏名', '部署', '役割', 'ステータス', '最終ログイン'], rows: staffRows, status: 3 } }
  ] },
  'audit': { type: 'list', actions: [['CSV', 'neutral', 'i-lucide-download']], blocks: [
    { id: 'filters', label: '検索・絞り込み', kind: 'filters', data: { search: '実行者・対象で検索', items: ['期間', '種別', '実行者'] } },
    { id: 'table', label: 'ログ一覧', kind: 'table', data: { columns: ['日時', '実行者', '種別', '操作', '対象'], rows: [['11/10 14:22', '佐藤 翔太', '配布', '一括配布を実行', '全プレイヤー'], ['11/10 13:05', '鈴木 美咲', '課金', '返金処理', 'T-0002190'], ['11/10 11:40', '高橋 大輔', '権限', '権限を変更', '鈴木 美咲'], ['11/10 09:12', '田中 彩', 'CSV', 'CSV を出力', '課金履歴 1,204 件']] } }
  ] },
  'approval': { type: 'list', blocks: [
    { id: 'kpis', label: '件数', kind: 'kpis', data: { items: [['承認待ち', '3'], ['今週の承認', '18'], ['差し戻し', '1']] } },
    { id: 'table', label: '承認待ち一覧', kind: 'table', data: { columns: ['申請', '申請者', '内容', '申請日時', '状態'], rows: [['一括配布', '佐藤 翔太', 'ジェム ×300 を全員に', '11/10 14:00', '承認待ち'], ['ガチャ公開', '山本 結衣', '2 周年記念 ステップアップ', '11/10 10:30', '承認待ち'], ['マスタ反映', '中村 拓也', 'ver.3.12.0 → 本番', '11/09 18:20', '承認済み']], status: 4 } },
    { id: 'detail', label: '申請内容と承認履歴', kind: 'timeline', data: { items: [['11/10 14:00', '佐藤 翔太 が申請', 'お詫び：11/9 の障害補填'], ['11/10 14:05', '承認者に通知（Slack）']] } }
  ] },
  'schedule-job': { type: 'list', blocks: [
    { id: 'table', label: '予約・ジョブ一覧', kind: 'table', data: { columns: ['実行日時', '内容', '登録者', '進み具合', '状態'], rows: [['11/15 02:00', 'メンテナンス開始', '佐藤 翔太', '—', '予約'], ['11/10 15:00', 'ガチャ G-2031 公開', '山本 結衣', '100%', '完了'], ['11/10 14:30', '一括配布 1,204,331 名', '佐藤 翔太', '62%', '実行中']], status: 4 } },
    { id: 'log', label: '実行ログ', kind: 'timeline', data: { items: [['14:30:02', '配布を開始'], ['14:41:17', '750,000 名に配布済み']] }, off: true }
  ] },
  'csv': { type: 'form', actions: [['取り込む', 'primary', 'i-lucide-upload']], blocks: [
    { id: 'upload', label: 'ファイルの選択', kind: 'upload', data: { text: 'CSV / Excel ファイルをドロップ', file: 'present_list_1110.csv（1,204 行）' } },
    { id: 'check', label: '取り込み前チェック', kind: 'alert', data: { color: 'warning', title: '3 行にエラーがあります', text: '12 行目：プレイヤー ID が存在しません ほか 2 件' } },
    { id: 'preview', label: '取り込み内容の確認', kind: 'table', data: { columns: ['行', 'プレイヤー ID', 'アイテム', '数量', '判定'], rows: [['1', 'P-100423', 'ジェム', '300', 'OK'], ['2', 'P-100871', 'ジェム', '300', 'OK'], ['12', 'P-999999', 'ジェム', '300', 'エラー']], status: 4 } }
  ] },
  'chat-notify': { type: 'form', actions: [['保存', 'primary', 'i-lucide-save']], blocks: [
    { id: 'channel', label: '通知先', kind: 'form', data: { fields: [f('Slack チャンネル', 'text', '#game-ops-alert'), f('通知する操作', 'checkbox', undefined, ['一括配布', 'ガチャ公開', '権限変更', 'エラー'])] } }
  ] },

  /* ダッシュボード */
  'kpi': { type: 'dashboard', blocks: [
    { id: 'kpis', label: '主要指標', kind: 'kpis', data: { items: [['DAU', '118,576', '+6.9%'], ['新規登録', '5,912', '+18.4%'], ['売上', '¥8,412,300', '+11.8%'], ['課金率', '3.74%', '+0.2pt']] } },
    { id: 'trend', label: '売上の推移', kind: 'line', data: { labels: days, values: [7.2, 6.8, 7.9, 8.4, 11.2, 10.5, 8.4], compare: [6.1, 6.4, 6.9, 7.1, 8.8, 9.0, 7.2] } },
    { id: 'platform', label: 'OS 別売上', kind: 'bars', data: { labels: ['iOS', 'Android', 'PC'], values: [52, 41, 7], unit: '%' } },
    { id: 'events', label: '開催中の施策', kind: 'list', data: { items: [['紅蓮の剣士 ピックアップ', '〜11/21', '開催中', 'success'], ['ギルド対抗戦', '〜11/16', '開催中', 'success'], ['週末ログボ', '11/14〜', '予定', 'info']] } }
  ] },
  'realtime': { type: 'dashboard', blocks: [
    { id: 'kpis', label: '現在の状況', kind: 'kpis', data: { items: [['同時接続', '24,108'], ['直近 1 時間の売上', '¥412,800'], ['エラー率', '0.12%']] } },
    { id: 'ccu', label: '同時接続数（直近 60 分）', kind: 'line', data: { labels: ['-60', '-50', '-40', '-30', '-20', '-10', '今'], values: [21, 22, 22.5, 23, 23.8, 24.2, 24.1] } }
  ] },
  'retention': { type: 'dashboard', blocks: [
    { id: 'heat', label: '継続率（登録日別）', kind: 'heatmap', data: { rows: ['11/01', '11/02', '11/03', '11/04', '11/05'], cols: ['翌日', '3 日後', '7 日後', '14 日後', '30 日後'], values: [[52, 38, 27, 19, 12], [49, 36, 25, 18, 0], [55, 40, 29, 0, 0], [51, 37, 0, 0, 0], [48, 0, 0, 0, 0]] } },
    { id: 'kpis', label: '平均', kind: 'kpis', data: { items: [['翌日', '51.0%'], ['7 日後', '27.0%'], ['30 日後', '12.0%']] } }
  ] },
  'sales-report': { type: 'dashboard', actions: [['CSV', 'neutral', 'i-lucide-download']], blocks: [
    { id: 'kpis', label: '合計', kind: 'kpis', data: { items: [['今月の売上', '¥254,320,268', '+11.8%'], ['前年同月比', '108.2%'], ['ARPPU', '¥1,913']] } },
    { id: 'daily', label: '日別売上', kind: 'bars', data: { labels: days, values: [72, 68, 79, 84, 112, 105, 84], unit: '万円' } },
    { id: 'products', label: '商品別売上', kind: 'table', data: { columns: ['商品', '件数', '売上', '構成比'], rows: [['ジェム ×8,000', '1,204', '¥11,799,200', '31%'], ['月間パス', '9,812', '¥5,985,320', '16%'], ['2 周年記念パック', '1,530', '¥4,590,000', '12%']], numeric: [1, 2, 3] } }
  ] },
  'event-report': { type: 'dashboard', blocks: [
    { id: 'kpis', label: '施策の効果', kind: 'kpis', data: { items: [['参加率', '38.2%'], ['期間中売上', '¥42,100,000', '+24%'], ['期間中 DAU', '131,240', '+9%']] } },
    { id: 'compare', label: '開催前後の比較', kind: 'line', data: { labels: ['-3', '-2', '-1', '開始', '+1', '+2', '+3'], values: [7, 7.2, 6.9, 12.4, 10.2, 9.5, 9.1] } }
  ] },
  'funnel': { type: 'dashboard', blocks: [
    { id: 'steps', label: 'チュートリアルの到達率', kind: 'bars', data: { labels: ['起動', '名前入力', '初戦闘', '初ガチャ', '完了'], values: [100, 92, 81, 74, 68], unit: '%' } }
  ] },

  /* プレイヤー */
  'player-search': { type: 'list', blocks: [
    { id: 'filters', label: '検索・絞り込み', kind: 'filters', data: { search: 'プレイヤー ID・名前・引き継ぎコード', items: ['OS', 'ステータス', '累計課金', '最終ログイン'] } },
    { id: 'table', label: '検索結果', kind: 'table', data: { columns: ['ID', '名前', 'OS', 'Lv', '累計課金', '最終ログイン', '状態'], rows: players, status: 6, numeric: [3, 4] } }
  ] },
  'player-detail': { type: 'detail', actions: [['付与・剥奪', 'neutral', 'i-lucide-gift'], ['アカウント停止', 'error', 'i-lucide-ban']], blocks: [
    { id: 'profile', label: 'プロフィール', kind: 'profile', data: { name: 'さくら99616', sub: 'P-100423 ・ iOS ・ Lv.128 ・ 登録 2025/02/16', badges: [['有効', 'success'], ['課金者', 'primary'], ['ギルド：桜花', 'neutral']] } },
    { id: 'currency', label: '所持通貨', kind: 'kpis', data: { items: [['有償ジェム', '1,240'], ['無償ジェム', '8,320'], ['ゴールド', '2,481,300'], ['累計課金', '¥48,930']] } },
    { id: 'basic', label: '基本情報', kind: 'kv', data: { items: [['プレイヤー ID', 'P-100423'], ['引き継ぎコード', '発行済み（11/02）'], ['端末', 'iPhone 15 / iOS 18.1'], ['アプリ', 'ver.3.11.2'], ['最終ログイン', '2026/11/10 14:18'], ['国・地域', '日本']] } },
    { id: 'items', label: '所持キャラ・アイテム', kind: 'table', data: { columns: ['種類', '名前', 'レア', '数・Lv'], rows: [['キャラ', '紅蓮の剣士', 'SSR', 'Lv.80'], ['キャラ', '月影の弓使い', 'SR', 'Lv.62'], ['アイテム', 'ガチャチケット', '—', '12'], ['アイテム', 'スタミナ回復薬', '—', '48']] } },
    { id: 'purchases', label: '課金履歴', kind: 'table', data: { columns: ['日時', '商品', '金額', '状態'], rows: [['11/07 06:36', 'ジェム ×3,600', '¥4,400', '完了'], ['10/28 05:52', 'ジェム ×120', '¥160', '返金済'], ['10/01 21:10', '月間パス', '¥610', '完了']], status: 3 } },
    { id: 'log', label: '行動ログ', kind: 'timeline', data: { items: [['11/10 14:18', 'ログイン'], ['11/10 14:20', 'ガチャ G-2031 を 10 回', 'SSR ×1'], ['11/10 14:31', 'イベントステージ 12 をクリア']] } },
    { id: 'memo', label: 'サポート対応メモ', kind: 'timeline', data: { items: [['11/09 鈴木', '引き継ぎできないと問い合わせ → 解決'], ['10/28 鈴木', '二重課金のため返金']] }, off: true },
    { id: 'ban', label: '停止履歴', kind: 'list', data: { items: [['停止履歴はありません', '']] }, off: true }
  ] },
  'inventory': { type: 'detail', blocks: [
    { id: 'currency', label: '通貨', kind: 'kpis', data: { items: [['有償ジェム', '1,240'], ['無償ジェム', '8,320'], ['ゴールド', '2,481,300']] } },
    { id: 'chars', label: 'キャラクター', kind: 'table', data: { columns: ['名前', 'レア', 'Lv', '入手日'], rows: [['紅蓮の剣士', 'SSR', '80', '11/10'], ['月影の弓使い', 'SR', '62', '09/03'], ['見習い騎士', 'R', '40', '02/16']] } },
    { id: 'items', label: 'アイテム', kind: 'table', data: { columns: ['名前', '数量', '有効期限'], rows: [['ガチャチケット', '12', '—'], ['スタミナ回復薬', '48', '—'], ['イベント交換券', '320', '11/21']] } },
    { id: 'history', label: '増減の履歴', kind: 'timeline', data: { items: [['11/10 14:20', '有償ジェム −3,000', 'ガチャ'], ['11/07 06:36', '有償ジェム +3,600', '購入']] }, off: true }
  ] },
  'grant': { type: 'form', actions: [['申請する', 'primary', 'i-lucide-send']], blocks: [
    { id: 'target', label: '対象', kind: 'form', data: { fields: [f('プレイヤー ID', 'text', 'P-100423'), f('種類', 'radio', '付与', ['付与', '剥奪（回収）'])] } },
    { id: 'items', label: '内容', kind: 'form', data: { fields: [f('アイテム', 'select', '無償ジェム'), f('数量', 'number', '300')] } },
    { id: 'reason', label: '理由', kind: 'form', data: { fields: [f('理由', 'select', '不具合の補填', ['不具合の補填', '問い合わせ対応', 'その他']), f('メモ', 'textarea', '11/9 の障害で消費したジェムの返還')] } },
    { id: 'confirm', label: '実行前の確認', kind: 'kv', data: { items: [['対象', 'さくら99616（P-100423）'], ['内容', '無償ジェム +300'], ['承認', '必要（サポートリーダー）']] } }
  ] },
  'ban': { type: 'form', actions: [['停止する', 'error', 'i-lucide-ban']], blocks: [
    { id: 'target', label: '対象', kind: 'profile', data: { name: 'もち_jp722', sub: 'P-101156 ・ Android ・ Lv.76', badges: [['不正の疑い', 'warning']] } },
    { id: 'period', label: '停止期間', kind: 'form', data: { fields: [f('期間', 'radio', '7 日間', ['24 時間', '7 日間', '30 日間', '無期限']), f('停止理由', 'select', '不正ツールの使用')] } },
    { id: 'message', label: 'プレイヤーへの表示文', kind: 'form', data: { fields: [f('表示文', 'textarea', '利用規約違反のため、アカウントを停止しました。')] } },
    { id: 'evidence', label: '根拠となるログ', kind: 'timeline', data: { items: [['11/09 22:01', 'スコアが上限の 20 倍'], ['11/09 22:03', '通信内容の改ざんを検知']] } }
  ] },
  'account-recovery': { type: 'form', actions: [['復旧する', 'primary', 'i-lucide-rotate-ccw']], blocks: [
    { id: 'search', label: '旧アカウントの特定', kind: 'form', data: { fields: [f('旧プレイヤー ID・名前', 'text', 'さくら99616'), f('最後の課金日時', 'date', '2026-11-07')] } },
    { id: 'check', label: '本人確認', kind: 'list', data: { items: [['課金レシートの一致', '一致', 'OK', 'success'], ['登録時期', '一致', 'OK', 'success'], ['よく使ったキャラ', '一部一致', '要確認', 'warning']] } },
    { id: 'history', label: '対応記録', kind: 'timeline', data: { items: [['11/10 10:00', '問い合わせ受付'], ['11/10 10:30', '本人確認 2/3 一致']] } }
  ] },
  'player-log': { type: 'list', actions: [['CSV', 'neutral', 'i-lucide-download']], blocks: [
    { id: 'filters', label: '絞り込み', kind: 'filters', data: { search: 'プレイヤー ID', items: ['期間', '種類（ログイン・課金・ガチャ・アイテム）'] } },
    { id: 'table', label: 'ログ', kind: 'table', data: { columns: ['日時', '種類', '内容', '増減'], rows: [['11/10 14:31', 'クエスト', 'イベントステージ 12', 'ゴールド +12,000'], ['11/10 14:20', 'ガチャ', 'G-2031 ×10', '有償ジェム −3,000'], ['11/10 14:18', 'ログイン', 'iOS ver.3.11.2', '—']] } }
  ] },
  'device': { type: 'list', blocks: [
    { id: 'table', label: '端末の履歴', kind: 'table', data: { columns: ['端末', 'OS', 'アプリ', '最終利用'], rows: [['iPhone 15', 'iOS 18.1', '3.11.2', '11/10'], ['iPad Air', 'iPadOS 17.6', '3.10.0', '08/12']] } }
  ] },
  'name-moderation': { type: 'list', blocks: [
    { id: 'filters', label: '絞り込み', kind: 'filters', data: { search: '名前で検索', items: ['検知理由', '対応状況'] } },
    { id: 'table', label: '審査待ち', kind: 'table', data: { columns: ['名前', 'プレイヤー', '検知理由', '状態'], rows: [['●●●死ね', 'P-103221', 'NG ワード', '未対応'], ['公式サポート', 'P-103880', 'なりすまし', '未対応'], ['かぶとむし', 'P-101002', '通報 3 件', '問題なし']], status: 3 } }
  ] },

  /* マスタ */
  'master-list': { type: 'list', actions: [['追加', 'primary', 'i-lucide-plus'], ['取り込み', 'neutral', 'i-lucide-upload']], blocks: [
    { id: 'tabs', label: 'マスタの種類', kind: 'filters', data: { search: 'ID・名前で検索', items: ['キャラ', 'アイテム', 'クエスト', '敵', 'スキル'] } },
    { id: 'table', label: 'キャラクター', kind: 'table', data: { columns: ['ID', '名前', 'レア', '属性', 'HP', '攻撃', '公開'], rows: [['1001', '紅蓮の剣士', 'SSR', '火', '12,400', '3,820', '公開中'], ['1002', '月影の弓使い', 'SR', '闇', '9,100', '2,950', '公開中'], ['1003', '天空の賢者', 'SSR', '光', '10,800', '3,410', '予約']], status: 6, numeric: [4, 5] } },
    { id: 'edit', label: '編集パネル', kind: 'form', data: { fields: [f('名前', 'text', '紅蓮の剣士'), f('レア', 'select', 'SSR'), f('HP', 'number', '12400'), f('攻撃', 'number', '3820')] }, off: true }
  ] },
  'master-import': { type: 'form', actions: [['取り込む', 'primary', 'i-lucide-upload']], blocks: [
    { id: 'upload', label: 'ファイル', kind: 'upload', data: { text: 'Excel / スプレッドシートを選択', file: 'character_master_v3.12.xlsx' } },
    { id: 'summary', label: '取り込み結果', kind: 'kpis', data: { items: [['追加', '12'], ['変更', '48'], ['削除', '0'], ['エラー', '2']] } },
    { id: 'errors', label: 'エラー', kind: 'alert', data: { color: 'error', title: '2 件のエラー', text: '1043 行目：スキル ID 9901 が存在しません ほか 1 件' } },
    { id: 'diff', label: '変更内容', kind: 'diff', data: { rows: [['1001', '攻撃', '3,700', '3,820'], ['1002', '名前', '月影の射手', '月影の弓使い']] } }
  ] },
  'master-validate': { type: 'list', blocks: [
    { id: 'kpis', label: '結果', kind: 'kpis', data: { items: [['チェック項目', '1,240'], ['エラー', '2'], ['警告', '7']] } },
    { id: 'table', label: '指摘一覧', kind: 'table', data: { columns: ['重要度', 'マスタ', '行', '内容'], rows: [['エラー', 'キャラ', '1043', '参照先のスキルがない'], ['エラー', 'クエスト', '220', '報酬 ID が空'], ['警告', 'アイテム', '88', '価格が 0']], status: 0 } }
  ] },
  'master-diff': { type: 'detail', actions: [['この版に戻す', 'neutral', 'i-lucide-history']], blocks: [
    { id: 'versions', label: 'バージョン', kind: 'timeline', data: { items: [['v3.12.0', '11/10 中村 拓也', '新キャラ 3 体追加'], ['v3.11.2', '10/28 中村 拓也', 'バランス調整'], ['v3.11.0', '10/15 山本 結衣']] } },
    { id: 'diff', label: '差分', kind: 'diff', data: { rows: [['キャラ 1001', '攻撃', '3,700', '3,820'], ['キャラ 1003', '（追加）', '—', '天空の賢者'], ['クエスト 220', '報酬', 'ジェム 50', 'ジェム 100']] } }
  ] },
  'master-promote': { type: 'form', actions: [['本番へ反映', 'error', 'i-lucide-rocket']], blocks: [
    { id: 'steps', label: '反映の手順', kind: 'list', data: { items: [['1. ステージングで確認', '完了', '完了', 'success'], ['2. 承認', '高橋 大輔 が承認', '完了', 'success'], ['3. 本番へ反映', '未実行', '待ち', 'neutral']] } },
    { id: 'diff', label: '反映される変更', kind: 'diff', data: { rows: [['キャラ', '追加', '—', '3 件'], ['キャラ', '変更', '—', '48 件']] } },
    { id: 'when', label: '反映日時', kind: 'form', data: { fields: [f('反映', 'radio', '日時を指定', ['すぐに反映', '日時を指定']), f('日時', 'date', '2026-11-15 06:00')] } }
  ] },
  'master-schedule': { type: 'list', blocks: [
    { id: 'calendar', label: '公開予定', kind: 'calendar', data: { events: [[15, 1, '新キャラ公開', 'primary'], [15, 1, 'v3.12.0', 'info'], [22, 2, '新エリア', 'success']] } },
    { id: 'table', label: '予約一覧', kind: 'table', data: { columns: ['公開日時', '内容', '状態'], rows: [['11/15 06:00', '天空の賢者 ほか 2 体', '予約'], ['11/22 15:00', '新エリア「天空遺跡」', '予約']], status: 2 } }
  ] },
  'asset': { type: 'list', actions: [['アップロード', 'primary', 'i-lucide-upload']], blocks: [
    { id: 'cards', label: '画像', kind: 'table', data: { columns: ['ファイル', '種類', 'サイズ', '使用箇所'], rows: [['banner_gacha_2031.png', 'バナー', '412 KB', 'ホーム'], ['icon_char_1003.png', 'アイコン', '48 KB', 'キャラ 1003']] } }
  ] },

  /* ガチャ */
  'gacha-list': { type: 'list', actions: [['ガチャを作成', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'calendar', label: 'スケジュール', kind: 'calendar', data: { events: [[7, 14, '紅蓮の剣士 PU', 'warning'], [22, 14, '2 周年 ステップアップ', 'primary']] }, off: true },
    { id: 'filters', label: '絞り込み', kind: 'filters', data: { search: 'ガチャ名で検索', items: ['状態', '種類', '期間'] } },
    { id: 'table', label: 'ガチャ一覧', kind: 'table', data: { columns: ['ID', 'ガチャ名', '期間', '消費', '状態'], rows: gachaRows, status: 4 } }
  ] },
  'gacha-setting': { type: 'form', actions: [['下書き保存', 'neutral', 'i-lucide-save'], ['公開を申請', 'primary', 'i-lucide-send']], blocks: [
    { id: 'basic', label: '基本設定', kind: 'form', data: { fields: [f('ガチャ名', 'text', '紅蓮の剣士 ピックアップ'), f('開催期間', 'date', '2026-11-07 15:00 〜 11-21 14:59'), f('種類', 'select', 'ピックアップ', ['通常', 'ピックアップ', 'ステップアップ', '限定'])] } },
    { id: 'cost', label: '消費と回数', kind: 'form', data: { fields: [f('1 回', 'number', 'ジェム 300'), f('10 回', 'number', 'ジェム 3,000'), f('1 日の上限', 'number', 'なし')] } },
    { id: 'pickup', label: 'ピックアップ対象', kind: 'list', data: { items: [['紅蓮の剣士', 'SSR ・ 排出率 0.7%', 'PU', 'warning']] } },
    { id: 'banner', label: 'バナー', kind: 'upload', data: { text: 'バナー画像（1280×720）', file: 'banner_gacha_2031.png' } },
    { id: 'preview', label: '確率表示の確認', kind: 'rates', data: { rows: [['SSR', '紅蓮の剣士（PU）', 0.7], ['SSR', 'その他 SSR', 2.3], ['SR', 'SR 全 24 種', 12], ['R', 'R 全 40 種', 85]] } }
  ] },
  'gacha-table': { type: 'form', actions: [['保存', 'primary', 'i-lucide-save']], blocks: [
    { id: 'rates', label: 'レアリティ別の確率', kind: 'rates', data: { rows: [['SSR', 'SSR 合計', 3], ['SR', 'SR 合計', 12], ['R', 'R 合計', 85]] } },
    { id: 'table', label: 'キャラ別の確率', kind: 'table', data: { columns: ['レア', 'キャラ', '確率', '備考'], rows: [['SSR', '紅蓮の剣士', '0.700%', 'PU'], ['SSR', '天空の賢者', '0.125%', ''], ['SR', '月影の弓使い', '0.500%', '']], numeric: [2] } },
    { id: 'check', label: '合計チェック', kind: 'alert', data: { color: 'success', title: '合計 100.000%', text: '確率の合計が 100% であることを確認しました。' } }
  ] },
  'gacha-pity': { type: 'form', actions: [['保存', 'primary', 'i-lucide-save']], blocks: [
    { id: 'pity', label: '天井', kind: 'form', data: { fields: [f('天井', 'switch', 'あり'), f('必要回数', 'number', '200 回'), f('交換対象', 'select', 'ピックアップキャラ')] } },
    { id: 'step', label: 'ステップアップ', kind: 'table', data: { columns: ['ステップ', '消費', '特典'], rows: [['1', 'ジェム 1,500', 'SR 以上 1 枠'], ['2', 'ジェム 2,500', '—'], ['3', 'ジェム 3,000', 'SSR 確定 1 枠']] } }
  ] },
  'gacha-rate-display': { type: 'detail', blocks: [
    { id: 'phone', label: 'ゲーム内の表示', kind: 'phone', data: { title: '提供割合', badge: 'ガチャ', body: 'SSR 3.000%\n　紅蓮の剣士 0.700%\n　その他 SSR 各 0.125%\nSR 12.000%\nR 85.000%' } },
    { id: 'rates', label: '設定値との照合', kind: 'rates', data: { rows: [['SSR', 'SSR 合計', 3], ['SR', 'SR 合計', 12], ['R', 'R 合計', 85]] } }
  ] },
  'gacha-sim': { type: 'dashboard', actions: [['10 万回 試す', 'primary', 'i-lucide-play']], blocks: [
    { id: 'kpis', label: '結果', kind: 'kpis', data: { items: [['試行回数', '100,000'], ['SSR 出現率', '2.996%'], ['天井到達', '0.4%']] } },
    { id: 'bars', label: 'レア別の出現率（設定との比較）', kind: 'bars', data: { labels: ['SSR', 'SR', 'R'], values: [3.0, 12.1, 84.9], unit: '%' } }
  ] },
  'gacha-log': { type: 'list', actions: [['CSV', 'neutral', 'i-lucide-download']], blocks: [
    { id: 'filters', label: '絞り込み', kind: 'filters', data: { search: 'プレイヤー ID', items: ['ガチャ', '期間', 'レア'] } },
    { id: 'table', label: '排出ログ', kind: 'table', data: { columns: ['日時', 'プレイヤー', 'ガチャ', '回数', '排出'], rows: [['11/10 14:20', 'P-100423', 'G-2031', '10', 'SSR 紅蓮の剣士 ほか'], ['11/10 14:02', 'P-102044', 'G-2031', '10', 'SR ×2 ほか']] } }
  ] },
  'gacha-audit': { type: 'dashboard', actions: [['CSV', 'neutral', 'i-lucide-download']], blocks: [
    { id: 'table', label: '設定確率と実績', kind: 'table', data: { columns: ['レア', '設定', '実績', '試行数', '判定'], rows: [['SSR', '3.000%', '3.012%', '2,481,300', '正常'], ['SR', '12.000%', '11.985%', '2,481,300', '正常'], ['R', '85.000%', '85.003%', '2,481,300', '正常']], status: 4 } }
  ] },

  /* イベント */
  'event-calendar': { type: 'list', blocks: [
    { id: 'calendar', label: 'カレンダー', kind: 'calendar', data: { events: [[1, 16, 'ギルド対抗戦', 'primary'], [7, 14, 'ガチャ PU', 'warning'], [14, 2, 'ログボ', 'success'], [15, 1, 'メンテ', 'error']] } },
    { id: 'list', label: '直近の予定', kind: 'list', data: { items: [['週末ログインボーナス', '11/14〜11/16', 'キャンペーン', 'success'], ['定期メンテナンス', '11/15 2:00〜6:00', 'メンテ', 'error']] } }
  ] },
  'event-setting': { type: 'form', actions: [['保存', 'primary', 'i-lucide-save']], blocks: [
    { id: 'basic', label: '基本設定', kind: 'form', data: { fields: [f('イベント名', 'text', 'ギルド対抗戦 シーズン 8'), f('期間', 'date', '11/09 15:00 〜 11/16 14:59'), f('参加条件', 'select', 'ランク 20 以上')] } },
    { id: 'stages', label: 'ステージ', kind: 'table', data: { columns: ['No.', 'ステージ', 'スタミナ', '報酬'], rows: [['1', '前哨戦', '10', 'ゴールド'], ['2', '本戦', '20', 'イベント交換券'], ['3', '決勝', '30', 'SSR 確定チケット']] } },
    { id: 'rewards', label: '報酬', kind: 'list', data: { items: [['1 位ギルド', 'ジェム ×3,000'], ['参加賞', 'ジェム ×300']] } }
  ] },
  'login-bonus': { type: 'form', actions: [['保存', 'primary', 'i-lucide-save']], blocks: [
    { id: 'period', label: '期間', kind: 'form', data: { fields: [f('名前', 'text', '週末ログインボーナス'), f('期間', 'date', '11/14 〜 11/16')] } },
    { id: 'days', label: '日数ごとの報酬', kind: 'table', data: { columns: ['日数', '報酬', '数量'], rows: [['1 日目', 'ジェム', '100'], ['2 日目', 'ガチャチケット', '1'], ['3 日目', 'ジェム', '300']] } }
  ] },
  'mission': { type: 'list', actions: [['追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'filters', label: '種類', kind: 'filters', data: { search: 'ミッション名', items: ['デイリー', 'ウィークリー', 'イベント'] } },
    { id: 'table', label: 'ミッション', kind: 'table', data: { columns: ['種類', '内容', '条件', '報酬'], rows: [['デイリー', 'クエストをクリア', '3 回', 'ゴールド 5,000'], ['ウィークリー', 'ガチャを回す', '10 回', 'ジェム 100']] } }
  ] },
  'ranking': { type: 'list', actions: [['順位報酬を配布', 'primary', 'i-lucide-gift']], blocks: [
    { id: 'table', label: 'ランキング', kind: 'table', data: { columns: ['順位', 'プレイヤー', 'スコア', '状態'], rows: [['1', 'Nova_X', '9,812,400', '確認済み'], ['2', 'さくら99616', '9,410,200', '確認済み'], ['3', 'ShadowPro7', '99,999,999', '除外']], status: 3 } },
    { id: 'alert', label: '不正の疑い', kind: 'alert', data: { color: 'warning', title: '1 名を除外しました', text: 'ShadowPro7：スコアが上限を超えています。' } }
  ] },
  'shop': { type: 'list', actions: [['商品を追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: '販売商品', kind: 'table', data: { columns: ['商品', '価格', '期間', '購入制限', '状態'], rows: [['2 周年記念パック', '¥3,000', '〜11/21', '1 回', '販売中'], ['スタミナ回復薬 ×10', 'ジェム 100', '常設', 'なし', '販売中']], status: 4 } }
  ] },

  /* 配布 */
  'present-bulk': { type: 'form', actions: [['承認を申請', 'primary', 'i-lucide-send']], blocks: [
    { id: 'target', label: '配布対象', kind: 'form', data: { fields: [f('対象', 'radio', '条件で指定', ['全プレイヤー', '条件で指定', 'CSV で指定']), f('条件', 'text', '11/9 13:00〜15:00 にログイン')] } },
    { id: 'items', label: '配布内容', kind: 'table', data: { columns: ['アイテム', '数量'], rows: [['無償ジェム', '300'], ['スタミナ回復薬', '5']] } },
    { id: 'message', label: 'プレゼントボックスの文言', kind: 'form', data: { fields: [f('件名', 'text', '障害のお詫び'), f('受取期限', 'date', '2026-12-10')] } },
    { id: 'confirm', label: '配布前の確認', kind: 'kpis', data: { items: [['対象人数', '1,204,331'], ['ジェム総数', '361,299,300']] } }
  ] },
  'apology': { type: 'form', actions: [['配布へ進む', 'primary', 'i-lucide-arrow-right']], blocks: [
    { id: 'incident', label: '障害の内容', kind: 'form', data: { fields: [f('発生日時', 'date', '11/09 13:02 〜 14:48'), f('影響', 'textarea', 'ログインできない・スタミナが消費された')] } },
    { id: 'target', label: '対象者の抽出', kind: 'kpis', data: { items: [['ログインできなかった', '412,003'], ['スタミナ消費', '88,140']] } },
    { id: 'plan', label: '補填内容', kind: 'list', data: { items: [['全員', 'ジェム ×300'], ['スタミナ消費者', 'スタミナ回復薬 ×3']] } }
  ] },
  'serial': { type: 'list', actions: [['コードを発行', 'primary', 'i-lucide-ticket']], blocks: [
    { id: 'table', label: '発行済みコード', kind: 'table', data: { columns: ['キャンペーン', '発行数', '利用数', '期限', '状態'], rows: [['雑誌付録 12 月号', '50,000', '31,204', '12/31', '有効'], ['コラボカフェ', '10,000', '9,880', '10/31', '終了']], status: 4, numeric: [1, 2] } }
  ] },
  'reward-history': { type: 'list', blocks: [
    { id: 'table', label: '配布履歴', kind: 'table', data: { columns: ['日時', '件名', '対象人数', '内容', '状態'], rows: [['11/10 14:30', '障害のお詫び', '1,204,331', 'ジェム ×300', '配布中'], ['11/01 15:00', '2 周年記念', '全員', 'SSR チケット', '完了']], status: 4 } }
  ] },

  /* お知らせ */
  'notice': { type: 'form', actions: [['下書き保存', 'neutral', 'i-lucide-save'], ['公開を予約', 'primary', 'i-lucide-calendar-check']], blocks: [
    { id: 'content', label: '内容', kind: 'form', data: { fields: [f('種別', 'radio', 'メンテナンス', ['お知らせ', 'メンテナンス', 'イベント', '不具合']), f('タイトル', 'text', '定期メンテナンスのお知らせ（11/15）'), f('本文', 'textarea', '下記の日程で定期メンテナンスを実施します。')] } },
    { id: 'period', label: '掲載期間・対象', kind: 'form', data: { fields: [f('掲載期間', 'date', '11/10 14:00 〜 11/17 14:00'), f('対象端末', 'checkbox', undefined, ['iOS', 'Android', 'PC']), f('表示方法', 'select', 'ログイン時に表示')] } },
    { id: 'push', label: 'プッシュ通知', kind: 'form', data: { fields: [f('プッシュ通知も送る', 'switch', 'オン'), f('通知の文言', 'text', '11/15 2:00〜6:00 に定期メンテナンスを行います')] }, off: true },
    { id: 'preview', label: 'ゲーム内プレビュー', kind: 'phone', data: { title: '定期メンテナンスのお知らせ（11/15）', badge: 'メンテナンス', body: '下記の日程で定期メンテナンスを実施します。\n\n■ 日時\n11 月 15 日（日）2:00〜6:00' } }
  ] },
  'push': { type: 'form', actions: [['配信を予約', 'primary', 'i-lucide-send']], blocks: [
    { id: 'content', label: '文言', kind: 'form', data: { fields: [f('タイトル', 'text', 'ガチャ開催中！'), f('本文', 'text', '紅蓮の剣士が登場。今だけ確率アップ')] } },
    { id: 'target', label: '対象と日時', kind: 'form', data: { fields: [f('対象', 'select', '3 日以上ログインしていない'), f('配信日時', 'date', '11/11 19:00')] } },
    { id: 'preview', label: '通知のプレビュー', kind: 'phone', data: { title: 'ガチャ開催中！', badge: 'プッシュ通知', body: '紅蓮の剣士が登場。今だけ確率アップ' } }
  ] },
  'banner': { type: 'list', actions: [['追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: 'バナー', kind: 'table', data: { columns: ['表示順', 'バナー', '期間', 'リンク先', '状態'], rows: [['1', '紅蓮の剣士 PU', '〜11/21', 'ガチャ G-2031', '表示中'], ['2', 'ギルド対抗戦', '〜11/16', 'イベント', '表示中'], ['3', '2 周年記念', '11/22〜', 'お知らせ', '予約']], status: 4 } }
  ] },
  'maintenance': { type: 'form', actions: [['メンテナンスを開始', 'error', 'i-lucide-wrench']], blocks: [
    { id: 'state', label: '現在の状態', kind: 'alert', data: { color: 'success', title: '通常運用中', text: '次回の予定：11/15 2:00〜6:00' } },
    { id: 'schedule', label: '予定', kind: 'form', data: { fields: [f('開始', 'date', '2026-11-15 02:00'), f('終了予定', 'date', '2026-11-15 06:00'), f('表示文', 'textarea', 'ただいまメンテナンス中です。')] } },
    { id: 'allow', label: '接続を許可する端末', kind: 'list', data: { items: [['社内 QA 端末', '12 台'], ['社内 IP', '203.0.113.0/24']] } }
  ] },

  /* 課金 */
  'purchases': { type: 'list', actions: [['CSV', 'neutral', 'i-lucide-download']], blocks: [
    { id: 'kpis', label: '集計', kind: 'kpis', data: { items: [['取引件数', '2,199'], ['売上', '¥3,364,400'], ['返金額', '¥97,170']] } },
    { id: 'filters', label: '絞り込み', kind: 'filters', data: { search: '取引 ID・プレイヤー', items: ['期間', '状態', 'OS', '商品'] } },
    { id: 'table', label: '課金履歴', kind: 'table', data: { columns: ['取引 ID', '日時', 'プレイヤー', '商品', '金額', '状態'], rows: [['T-0000102', '11/07 06:36', 'Ace01485', 'スターターパック', '¥370', '完了'], ['T-0000969', '11/07 05:46', 'さくら99616', '2 周年記念パック', '¥3,000', '完了'], ['T-0002190', '10/28 05:52', 'こはる_jp911', 'ジェム ×120', '¥160', '返金済']], status: 5, numeric: [4] } }
  ] },
  'refund': { type: 'form', actions: [['返金する', 'error', 'i-lucide-undo-2']], blocks: [
    { id: 'tx', label: '取引', kind: 'kv', data: { items: [['取引 ID', 'T-0000969'], ['プレイヤー', 'さくら99616'], ['商品', '2 周年記念パック ¥3,000'], ['ストア取引 ID', 'GPA.3321-0912-8810']] } },
    { id: 'reason', label: '理由', kind: 'form', data: { fields: [f('理由', 'select', '二重課金'), f('付与済みアイテム', 'radio', '回収する', ['回収する', '回収しない'])] } },
    { id: 'warn', label: '注意', kind: 'alert', data: { color: 'warning', title: '有償ジェムが不足しています', text: '回収時に所持数がマイナスになるため、残りは無償ジェムから回収します。' } }
  ] },
  'products': { type: 'list', actions: [['商品を追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: 'ストア商品', kind: 'table', data: { columns: ['商品 ID', '名前', '価格', 'iOS', 'Android', '状態'], rows: [['gem_8000', 'ジェム ×8,000', '¥9,800', '登録済', '登録済', '販売中'], ['pack_anniv', '2 周年記念パック', '¥3,000', '登録済', '審査中', '準備中']], status: 5 } }
  ] },
  'currency-balance': { type: 'dashboard', actions: [['報告用 CSV', 'neutral', 'i-lucide-download']], blocks: [
    { id: 'kpis', label: '残高', kind: 'kpis', data: { items: [['有償通貨の未使用残高', '¥128,410,200'], ['基準日', '2026/09/30'], ['前回比', '+4.2%']] } },
    { id: 'table', label: '月別の推移', kind: 'table', data: { columns: ['月末', '発行', '使用', '残高'], rows: [['9 月', '¥41,200,000', '¥39,800,000', '¥128,410,200'], ['8 月', '¥38,900,000', '¥37,100,000', '¥127,010,200']], numeric: [1, 2, 3] } }
  ] },
  'age-limit': { type: 'form', actions: [['保存', 'primary', 'i-lucide-save']], blocks: [
    { id: 'table', label: '年齢別の上限', kind: 'table', data: { columns: ['年齢', '月の上限'], rows: [['16 歳未満', '¥5,000'], ['16〜19 歳', '¥10,000'], ['20 歳以上', 'なし']] } }
  ] },

  /* サポート */
  'inquiry': { type: 'list', blocks: [
    { id: 'kpis', label: '状況', kind: 'kpis', data: { items: [['未対応', '24'], ['対応中', '11'], ['平均初回返信', '3.2 時間']] } },
    { id: 'table', label: '問い合わせ', kind: 'table', data: { columns: ['受付', 'プレイヤー', '種類', '件名', '担当', '状態'], rows: [['11/10 14:02', 'P-100423', '引き継ぎ', '機種変更で引き継げない', '鈴木', '対応中'], ['11/10 13:40', 'P-101156', '課金', '購入したジェムが届かない', '—', '未対応']], status: 5 } }
  ] },
  'inquiry-thread': { type: 'detail', blocks: [
    { id: 'profile', label: 'プレイヤー', kind: 'profile', data: { name: 'さくら99616', sub: 'P-100423 ・ 問い合わせ 3 件目', badges: [['対応中', 'info']] } },
    { id: 'thread', label: 'やりとり', kind: 'timeline', data: { items: [['11/10 14:02 プレイヤー', '機種変更したら引き継げません'], ['11/10 14:30 鈴木', '本人確認のため、最後の購入日をお知らせください']] } },
    { id: 'reply', label: '返信', kind: 'form', data: { fields: [f('テンプレート', 'select', '引き継ぎ：本人確認'), f('返信', 'textarea', '')] } }
  ] },
  'reply-template': { type: 'list', actions: [['追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: 'テンプレート', kind: 'table', data: { columns: ['分類', '名前', '使用回数'], rows: [['引き継ぎ', '本人確認のお願い', '412'], ['課金', '未着時の確認', '208']] } }
  ] },

  /* 運用 */
  'app-version': { type: 'list', actions: [['追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: 'バージョン', kind: 'table', data: { columns: ['OS', 'バージョン', '公開日', '強制アップデート', '状態'], rows: [['iOS', '3.12.0', '11/15', '—', '審査中'], ['iOS', '3.11.2', '10/28', '—', '最新'], ['Android', '3.10.0', '10/01', '対象', '要更新']], status: 4 } }
  ] },
  'feature-flag': { type: 'list', blocks: [
    { id: 'table', label: '機能の ON / OFF', kind: 'table', data: { columns: ['機能', '対象', '状態', '更新'], rows: [['ギルドチャット', '全員', 'ON', '11/01'], ['新ガチャ演出', '10%', 'ON（段階公開）', '11/09'], ['フレンド招待', '全員', 'OFF', '11/10']], status: 2 } }
  ] },
  'ab-test': { type: 'dashboard', blocks: [
    { id: 'kpis', label: '結果', kind: 'kpis', data: { items: [['A：通常', '購入率 3.1%'], ['B：割引表示', '購入率 3.8%', '+0.7pt'], ['信頼度', '96%']] } },
    { id: 'bars', label: '購入率の比較', kind: 'bars', data: { labels: ['A', 'B'], values: [3.1, 3.8], unit: '%' } }
  ] },
  'ng-word': { type: 'list', actions: [['追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: 'NG ワード', kind: 'table', data: { columns: ['言葉', '対象', '一致', '追加日'], rows: [['公式', '名前', '部分一致', '02/16'], ['死ね', '名前・チャット', '部分一致', '02/16']] } }
  ] },
  'server-status': { type: 'dashboard', blocks: [
    { id: 'list', label: '稼働状況', kind: 'list', data: { items: [['ゲーム API', '正常', '正常', 'success'], ['データベース', '正常', '正常', 'success'], ['課金 API', '遅延あり', '注意', 'warning']] } },
    { id: 'line', label: 'エラー率', kind: 'line', data: { labels: days, values: [0.1, 0.12, 0.09, 0.11, 0.4, 0.13, 0.12] } }
  ] },

  /* 不正対策 */
  'cheat-detect': { type: 'list', blocks: [
    { id: 'kpis', label: '状況', kind: 'kpis', data: { items: [['疑いあり', '38'], ['本日停止', '4']] } },
    { id: 'table', label: '疑いのあるプレイヤー', kind: 'table', data: { columns: ['プレイヤー', '検知内容', '検知日時', '危険度', '状態'], rows: [['ShadowPro7', 'スコア異常', '11/09 22:01', '高', '未対応'], ['もち_jp722', '通信改ざん', '11/09 22:03', '高', '停止済み'], ['ねこ759', 'ゴールド急増', '11/08 10:12', '中', '確認中']], status: 4 } }
  ] },
  'cheat-rule': { type: 'list', actions: [['ルールを追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: '検知ルール', kind: 'table', data: { columns: ['ルール', '条件', '対応', '状態'], rows: [['スコア異常', '上限の 3 倍以上', '一覧に追加', '有効'], ['ゴールド急増', '1 時間で 1,000 万以上', '一覧に追加', '有効']], status: 3 } }
  ] },
  'ip-block': { type: 'list', actions: [['追加', 'primary', 'i-lucide-plus']], blocks: [
    { id: 'table', label: '制限リスト', kind: 'table', data: { columns: ['種類', '値', '理由', '期限'], rows: [['IP', '198.51.100.24', '不正アクセス', '無期限'], ['端末 ID', 'a91f…22c0', 'チート', '12/31']] } }
  ] }
}

/** 定義の無い画面用の汎用の中身 */
export function screenSpecOf(patternId: string, name: string): ScreenSpec {
  return SCREEN_SPECS[patternId] ?? {
    type: 'list',
    blocks: [
      { id: 'filters', label: '検索・絞り込み', kind: 'filters', data: { search: `${name}を検索`, items: ['期間', '状態'] } },
      { id: 'table', label: '一覧', kind: 'table', data: { columns: ['ID', '名前', '更新日', '状態'], rows: [['1', 'サンプル', '11/10', '有効']] } }
    ]
  }
}

export interface ScreenChoice {
  layout?: string
  blocks?: string[]
}

/** 案に保存された選択（無ければ初期値）を返す */
export function resolveScreen(spec: ScreenSpec, choice?: ScreenChoice) {
  const layouts = SCREEN_TYPES[spec.type].layouts
  const layout = layouts.some(l => l.value === choice?.layout) ? choice!.layout! : layouts[0]!.value
  const enabled = choice?.blocks ?? spec.blocks.filter(b => !b.off).map(b => b.id)
  return { layout, blocks: spec.blocks.filter(b => enabled.includes(b.id)) }
}
