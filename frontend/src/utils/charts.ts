import type { EChartsOption } from 'echarts'
import type { CSSProperties } from 'vue'

export const chartColors = ['#1769e0', '#15b8c7', '#e5a11a', '#7d6be8', '#df4f56']

export const chartTooltip: EChartsOption['tooltip'] = {
  backgroundColor: 'rgba(8, 27, 50, 0.94)',
  borderWidth: 0,
  padding: [10, 12],
  textStyle: {
    color: '#f4f8ff',
    fontSize: 12,
  },
  extraCssText: 'border-radius: 8px; box-shadow: 0 10px 26px rgba(3, 18, 38, 0.22);',
}

export const chartTextStyle = {
  fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
}

export const axisLineStyle = {
  lineStyle: {
    color: '#dfe7f1',
  },
}

export const axisLabelStyle = {
  color: '#7a879d',
  fontSize: 11,
}

export const splitLineStyle = {
  lineStyle: {
    color: '#edf2f7',
    type: 'dashed' as const,
  },
}

export function smallBarStyle(color: string): CSSProperties {
  return {
    height: '6px',
    borderRadius: '999px',
    background: color,
  }
}
