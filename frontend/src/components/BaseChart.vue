<script setup lang="ts">
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: string
    loading?: boolean
  }>(),
  {
    height: '300px',
    loading: false,
  },
)

const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let observer: ResizeObserver | null = null

function render() {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value, undefined, { renderer: 'canvas' })
  chart.setOption(props.option, true)
  if (props.loading) {
    chart.showLoading('default', {
      text: '加载中',
      color: '#1769e0',
      textColor: '#718096',
      maskColor: 'rgba(255, 255, 255, 0.72)',
    })
  } else {
    chart.hideLoading()
  }
}

onMounted(async () => {
  await nextTick()
  render()
  if (chartEl.value) {
    observer = new ResizeObserver(() => chart?.resize())
    observer.observe(chartEl.value)
  }
})

watch(() => props.option, render, { deep: true })
watch(
  () => props.loading,
  () => render(),
)

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="chartEl" class="base-chart" :style="{ height }" />
</template>

<style scoped>
.base-chart {
  width: 100%;
  min-height: 160px;
}
</style>
