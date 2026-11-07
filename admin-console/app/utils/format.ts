import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('ja-JP')
const compact = new Intl.NumberFormat('ja-JP', { notation: 'compact', maximumFractionDigits: 1 })

export const formatYen = (v: number) => yen.format(v)
export const formatNumber = (v: number) => num.format(v)
export const formatCompact = (v: number) => compact.format(v)
export const formatCompactYen = (v: number) => `¥${compact.format(v)}`
export const formatPercent = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`

export function formatDateTime(value?: string | null) {
  return value ? format(new Date(value), 'yyyy/MM/dd HH:mm') : '—'
}

export function formatDate(value?: string | null) {
  return value ? format(new Date(value), 'yyyy/MM/dd') : '—'
}

export function formatRelative(value?: string | null) {
  return value ? formatDistanceToNow(new Date(value), { addSuffix: true, locale: ja }) : '—'
}
