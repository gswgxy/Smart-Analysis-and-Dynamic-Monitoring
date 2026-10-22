import type { RiskLevel } from '@/types'

export function riskColor(level: RiskLevel): string {
  return {
    R1: '#0ba58a',
    R2: '#5a8fd8',
    R3: '#e5a11a',
    R4: '#e57431',
    R5: '#df4f56',
  }[level]
}
