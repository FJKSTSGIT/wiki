/**
 * CSV 生成ユーティリティ（UI 非依存）
 * - Excel で文字化けしないよう UTF-8 BOM を付与
 * - カンマ・改行・ダブルクォートをエスケープ
 * - 先頭が = + - @ の値は数式インジェクション対策でエスケープ
 */
export interface CsvColumn<T> {
  /** CSV のヘッダー名 */
  header: string
  /** 行オブジェクトのキー（value を指定しない場合に使用） */
  key?: keyof T & string
  /** 値の取り出し・整形 */
  value?: (row: T) => unknown
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let text = value instanceof Date ? value.toISOString() : Array.isArray(value) ? value.join(' / ') : String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const header = columns.map(c => escapeCell(c.header)).join(',')
  const body = rows.map(row =>
    columns.map(c => escapeCell(c.value ? c.value(row) : c.key ? row[c.key] : '')).join(',')
  )
  return [header, ...body].join('\r\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 例: players_20261107-1530.csv */
export function csvFilename(base: string, date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${base}_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.csv`
}
