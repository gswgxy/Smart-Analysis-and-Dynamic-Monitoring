import type { RiskLevel, TrustLevel } from '@/types'

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(1)}万`
  return formatNumber(value)
}

export function formatPercent(value: number, digits = 1): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`
}

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function riskLabel(level: RiskLevel): string {
  return {
    R1: '低风险',
    R2: '一般',
    R3: '较高',
    R4: '高风险',
    R5: '重大',
  }[level]
}

export function riskType(level: RiskLevel): 'success' | 'info' | 'warning' | 'danger' {
  if (level === 'R1') return 'success'
  if (level === 'R2') return 'info'
  if (level === 'R3') return 'warning'
  return 'danger'
}

export function trustLabel(level: TrustLevel): string {
  return {
    A: '可直接使用',
    B: '可使用，需注意限制',
    C: '需人工复核',
    D: '仅供人工参考',
  }[level]
}

export function trustColor(level: TrustLevel): string {
  return {
    A: '#0b9b78',
    B: '#1769e0',
    C: '#d58b12',
    D: '#d94e56',
  }[level]
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: '草稿',
    SUBMITTED: '已提交',
    REVIEWING: '审核中',
    APPROVED: '审核通过',
    RETURNED: '退回修改',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
    NEW: '待确认',
    CONFIRMED: '已确认',
    PROCESSING: '处置中',
    RESOLVED: '已解决',
    IGNORED: '已忽略',
    CLOSED: '已关闭',
    RUNNING: '运行中',
    SUCCESS: '已完成',
    FAILED: '失败',
    QUEUED: '排队中',
  }
  return map[status] || status
}

export function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}
