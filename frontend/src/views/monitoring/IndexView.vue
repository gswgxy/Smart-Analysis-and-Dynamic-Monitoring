<script setup lang="ts">
import { Download, InfoFilled, Refresh, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  dataVersion,
  indexContributions,
  indexDimensions,
  indexTrend,
  months,
  updatedAt,
} from '@/mock/data'
import {
  axisLabelStyle,
  axisLineStyle,
  chartTooltip,
  splitLineStyle,
} from '@/utils/charts'

const selectedCode = ref('INNOVATION')
const compareMode = ref('同比 + 环比')
const loading = ref(false)

const selectedDimension = computed(
  () => indexDimensions.find((item) => item.code === selectedCode.value) || indexDimensions[0],
)

const radarOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip },
  radar: {
    center: ['50%', '52%'],
    radius: '64%',
    splitNumber: 4,
    indicator: indexDimensions.map((item) => ({ name: item.name, max: 100 })),
    axisName: { color: '#637289', fontSize: 10 },
    splitArea: {
      areaStyle: { color: ['rgba(244,248,253,0.3)', 'rgba(239,245,251,0.7)'] },
    },
    splitLine: { lineStyle: { color: '#dfe8f2' } },
    axisLine: { lineStyle: { color: '#e4ebf3' } },
  },
  series: [
    {
      type: 'radar',
      symbol: 'circle',
      symbolSize: 5,
      data: [
        {
          value: indexDimensions.map((item) => item.score),
          name: '本期得分',
          areaStyle: { color: 'rgba(23,105,224,0.16)' },
          lineStyle: { width: 2, color: '#1769e0' },
          itemStyle: { color: '#1769e0' },
        },
        {
          value: [76.2, 72.8, 78.5, 75.1, 73.8],
          name: '上期得分',
          areaStyle: { color: 'rgba(21,184,199,0.04)' },
          lineStyle: { width: 1.4, color: '#15b8c7', type: 'dashed' },
          itemStyle: { color: '#15b8c7' },
        },
      ],
    },
  ],
  legend: {
    bottom: 0,
    left: 'center',
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    textStyle: { color: '#7b889b', fontSize: 9 },
  },
}))

const trendOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  grid: { top: 20, left: 38, right: 18, bottom: 27 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: months.map((month) => month.slice(5)),
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    min: 110,
    max: 135,
    axisLabel: axisLabelStyle,
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  series: [
    {
      name: '综合景气指数',
      type: 'line',
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 5,
      data: indexTrend,
      lineStyle: { color: '#1769e0', width: 2.4 },
      itemStyle: { color: '#1769e0', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(23,105,224,0.16)' },
            { offset: 1, color: 'rgba(23,105,224,0)' },
          ],
        },
      },
      markLine: {
        symbol: 'none',
        silent: true,
        lineStyle: { color: '#d7b06a', type: 'dashed', width: 1 },
        label: { formatter: '荣枯线 100', color: '#b68b3c', fontSize: 8 },
        data: [{ yAxis: 120 }],
      },
    },
  ],
}))

const waterfallOption = computed<EChartsOption>(() => {
  let cumulative = 0
  const base: number[] = []
  const bars: Array<{ value: number; itemStyle: { color: string } }> = []

  for (const item of indexContributions) {
    if (item.value >= 0) {
      base.push(Number(cumulative.toFixed(2)))
      bars.push({ value: item.value, itemStyle: { color: '#1769e0' } })
      cumulative += item.value
    } else {
      cumulative += item.value
      base.push(Number(cumulative.toFixed(2)))
      bars.push({ value: Math.abs(item.value), itemStyle: { color: '#df4f56' } })
    }
  }

  return {
    tooltip: {
      ...chartTooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const rows = params as Array<{ dataIndex: number; seriesName: string; value: number }>
        const index = rows[0]?.dataIndex ?? 0
        const item = indexContributions[index]
        return `${item.name}<br/>贡献度：<b>${item.value > 0 ? '+' : ''}${item.value}</b>`
      },
    },
    grid: { top: 22, left: 32, right: 18, bottom: 58 },
    xAxis: {
      type: 'category',
      data: indexContributions.map((item) => item.name),
      axisLine: axisLineStyle,
      axisTick: { show: false },
      axisLabel: { ...axisLabelStyle, interval: 0, rotate: 28, fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { ...axisLabelStyle, formatter: '{value}' },
      splitLine: splitLineStyle,
      axisLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        stack: 'waterfall',
        silent: true,
        itemStyle: { color: 'transparent' },
        emphasis: { itemStyle: { color: 'transparent' } },
        data: base,
      },
      {
        type: 'bar',
        stack: 'waterfall',
        barWidth: 20,
        data: bars,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: '#68778c',
          fontSize: 8,
          formatter: (params: any) => {
            const value = indexContributions[params.dataIndex].value
            return `${value > 0 ? '+' : ''}${value}`
          },
        },
      },
    ],
  }
})

const dimensionSeries = computed(() => ({
  months: months.slice(6).map((item) => item.slice(5)),
  current: [74.1, 76.4, 78.2, 80.5, 81.9, 84.2],
  previous: [71.2, 72.6, 74.1, 76.8, 78.1, 80.1],
}))

const dimensionTrendOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  legend: {
    right: 0,
    top: 0,
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    textStyle: { color: '#78859a', fontSize: 9 },
  },
  grid: { top: 34, left: 34, right: 12, bottom: 24 },
  xAxis: {
    type: 'category',
    data: dimensionSeries.value.months,
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    min: 60,
    max: 90,
    axisLabel: axisLabelStyle,
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  series: [
    {
      name: '本期',
      type: 'line',
      smooth: true,
      data: dimensionSeries.value.current,
      symbolSize: 4,
      lineStyle: { color: '#1769e0', width: 2 },
      itemStyle: { color: '#1769e0' },
    },
    {
      name: '上年同期',
      type: 'line',
      smooth: true,
      data: dimensionSeries.value.previous,
      symbol: 'none',
      lineStyle: { color: '#a9b8ca', width: 1.4, type: 'dashed' },
    },
  ],
}))

function reload() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('指数结果已按最新数据版本刷新')
  }, 500)
}

function exportResult() {
  ElMessage.success('指数计算明细导出任务已创建')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="综合景气指数"
      description="由产业规模、成长态势、创新活力、市场活跃度和风险安全指数加权形成，支持查看贡献度、维度明细与历史版本。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="reload">重算刷新</el-button>
        <el-button :icon="Download" @click="exportResult">导出明细</el-button>
        <el-button type="primary" :icon="TrendCharts">切换权重方案</el-button>
      </template>
    </PageHeader>

    <FilterBar label="指数范围">
      <el-select model-value="人工智能" style="width: 145px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
        <el-option label="智能网联汽车" value="智能网联汽车" />
      </el-select>
      <el-select model-value="全市" style="width: 115px">
        <el-option label="全市" value="全市" />
        <el-option label="海淀区" value="海淀区" />
      </el-select>
      <el-date-picker model-value="2026-10" type="month" style="width: 140px" />
      <el-select v-model="compareMode" style="width: 155px">
        <el-option label="同比 + 环比" value="同比 + 环比" />
        <el-option label="与全市均值比较" value="与全市均值比较" />
      </el-select>
      <template #extra>
        <span class="status-line"><span class="inline-dot" />权重版本 V2026.10</span>
      </template>
    </FilterBar>

    <div class="index-hero">
      <div class="index-hero__score">
        <span class="index-hero__label">综合景气指数</span>
        <div class="score-ring">
          <div class="score-ring__inner">
            <strong>128.6</strong>
            <span>景气</span>
          </div>
        </div>
        <div class="score-deltas">
          <span>同比 <b>+8.2</b></span>
          <span>环比 <b>+0.9</b></span>
        </div>
      </div>
      <div class="index-hero__summary">
        <div class="index-hero__tag">本期判断</div>
        <h2>产业运行处于景气区间，创新活力为主要拉动力</h2>
        <p>
          五个维度中，创新活力得分 84.2，贡献度最高；产业规模和成长态势保持稳定。
          风险安全指数下降 2.2 点，主要受供应链集中度与风险事件增加影响。
        </p>
        <div class="index-hero__pills">
          <span><i class="is-up" /> 拉高项：知识产权产出 +2.1</span>
          <span><i class="is-down" /> 拖累项：风险事件 -1.2</span>
        </div>
      </div>
      <div class="index-hero__weights">
        <span>权重结构</span>
        <div v-for="item in indexDimensions" :key="item.code">
          <label>{{ item.name }}</label>
          <div><i :style="{ width: `${item.weight * 4}%` }" /></div>
          <strong>{{ item.weight }}%</strong>
        </div>
        <small>模型版本 INDEX-AI-V3.2</small>
      </div>
    </div>

    <div class="index-main">
      <DataCard title="五维雷达" subtitle="本期与上期维度得分对比">
        <BaseChart :option="radarOption" height="326px" />
      </DataCard>
      <DataCard title="指数趋势" subtitle="近 12 个月综合景气指数">
        <template #actions>
          <span class="tag-soft">当前 128.6</span>
        </template>
        <BaseChart :option="trendOption" height="326px" />
      </DataCard>
    </div>

    <DataCard title="指标贡献瀑布" subtitle="各指标对指数环比变化的贡献度，正值为拉高、负值为拖累">
      <template #actions>
        <el-radio-group model-value="全部指标" size="small">
          <el-radio-button value="全部指标">全部指标</el-radio-button>
          <el-radio-button value="拉高项">拉高项</el-radio-button>
          <el-radio-button value="拖累项">拖累项</el-radio-button>
        </el-radio-group>
      </template>
      <BaseChart :option="waterfallOption" height="300px" />
    </DataCard>

    <div class="index-details">
      <DataCard title="维度明细" subtitle="点击维度查看趋势、权重与贡献度">
        <el-table
          :data="indexDimensions"
          highlight-current-row
          :current-row-key="selectedCode"
          row-key="code"
          @row-click="(row) => (selectedCode = row.code)"
        >
          <el-table-column prop="name" label="维度" min-width="130">
            <template #default="{ row }">
              <div class="dimension-name">
                <span :class="row.code.toLowerCase().slice(0, 2)" />
                <strong>{{ row.name }}</strong>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="得分" width="90" align="right">
            <template #default="{ row }"><b>{{ row.score }}</b></template>
          </el-table-column>
          <el-table-column label="同比" width="90" align="right">
            <template #default="{ row }">
              <span :class="row.delta >= 0 ? 'text-up' : 'text-down'">
                {{ row.delta > 0 ? '+' : '' }}{{ row.delta }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="权重" width="80" align="right" />
          <el-table-column label="贡献度" width="100" align="right">
            <template #default="{ row }">
              <span :class="row.contribution >= 0 ? 'text-up' : 'text-down'">
                {{ row.contribution > 0 ? '+' : '' }}{{ row.contribution }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <span class="quality-pill" :class="{ 'is-warn': row.delta < 0 }">
                {{ row.delta < 0 ? '需关注' : '正常' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </DataCard>

      <DataCard
        :title="`${selectedDimension.name} · 趋势`"
        :subtitle="`当前得分 ${selectedDimension.score}，权重 ${selectedDimension.weight}%`"
      >
        <BaseChart :option="dimensionTrendOption" height="254px" />
        <template #footer>
          <div class="dimension-footer">
            <span><el-icon><InfoFilled /></el-icon> 指标已做上下 1% 缩尾与极差归一化</span>
            <el-button text size="small">查看计算明细</el-button>
          </div>
        </template>
      </DataCard>
    </div>

    <div class="index-bottom">
      <DataCard title="拉高项" subtitle="对指数提升贡献最大的指标">
        <div class="contribution-list">
          <div v-for="item in indexContributions.filter((x) => x.value > 0)" :key="item.name">
            <span>{{ item.name }}</span>
            <div><i :style="{ width: `${item.value * 40}%` }" /></div>
            <strong>+{{ item.value }}</strong>
          </div>
        </div>
      </DataCard>
      <DataCard title="拖累项" subtitle="对指数形成负向影响的指标">
        <div class="contribution-list is-negative">
          <div v-for="item in indexContributions.filter((x) => x.value < 0)" :key="item.name">
            <span>{{ item.name }}</span>
            <div><i :style="{ width: `${Math.abs(item.value) * 40}%` }" /></div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </DataCard>
      <DataCard title="版本记录" subtitle="权重与计算结果可回溯">
        <div class="version-list">
          <div>
            <span class="version-dot is-active" />
            <div><strong>V2026.10</strong><small>2026-10-18 · 当前版本</small></div>
            <em>生效</em>
          </div>
          <div>
            <span class="version-dot" />
            <div><strong>V2026.09</strong><small>2026-09-18 · 风险权重 15%</small></div>
            <em>归档</em>
          </div>
          <div>
            <span class="version-dot" />
            <div><strong>V2026.08</strong><small>2026-08-18 · 专家校准</small></div>
            <em>归档</em>
          </div>
        </div>
      </DataCard>
    </div>

    <div class="data-footnote">
      <span>计算口径：风险安全指数为反向指标；缺失值采用同类均值或插值，不以 0 替代。</span>
      <span>计算结果保留数据期次、权重版本与模型版本。</span>
    </div>
  </div>
</template>

<style scoped>
.index-hero {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 250px;
  padding: 22px;
  background:
    radial-gradient(circle at 85% 0%, rgba(21, 184, 199, 0.06), transparent 24%),
    #fff;
  border: 1px solid var(--dip-line);
  border-radius: 14px;
  box-shadow: var(--dip-shadow);
}

.index-hero__score {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-right: 22px;
  border-right: 1px solid #e9eef5;
}

.index-hero__label {
  color: #708096;
  font-size: 10px;
}

.score-ring {
  position: relative;
  display: flex;
  width: 142px;
  height: 142px;
  align-items: center;
  justify-content: center;
  margin: 10px 0 8px;
  background: conic-gradient(#1769e0 0 72%, #eef3f9 72% 100%);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(23, 105, 224, 0.04);
}

.score-ring::before {
  position: absolute;
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 50%;
  content: "";
}

.score-ring__inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.score-ring__inner strong {
  display: block;
  color: #10233d;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 38px;
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.score-ring__inner span {
  display: inline-block;
  padding: 2px 7px;
  color: #0c846d;
  background: #eaf8f4;
  border-radius: 999px;
  font-size: 9px;
}

.score-deltas {
  display: flex;
  gap: 15px;
  color: #8390a2;
  font-size: 9px;
}

.score-deltas b {
  color: #0a9b76;
  font-weight: 600;
}

.index-hero__summary {
  padding: 7px 26px;
}

.index-hero__tag {
  display: inline-block;
  padding: 3px 7px;
  color: #1769e0;
  background: #edf4ff;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.index-hero__summary h2 {
  margin: 11px 0 9px;
  color: #1f324b;
  font-size: 19px;
  font-weight: 620;
  line-height: 1.45;
}

.index-hero__summary p {
  max-width: 650px;
  margin: 0;
  color: #728196;
  font-size: 11px;
  line-height: 1.8;
}

.index-hero__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}

.index-hero__pills span {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  color: #5d6d82;
  background: #f6f9fc;
  border-radius: 5px;
  font-size: 9px;
}

.index-hero__pills i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.index-hero__pills .is-up {
  background: #0ba58a;
}

.index-hero__pills .is-down {
  background: #df4f56;
}

.index-hero__weights {
  padding: 4px 0 2px 22px;
  border-left: 1px solid #e9eef5;
}

.index-hero__weights > span {
  display: block;
  margin-bottom: 10px;
  color: #7b899b;
  font-size: 9px;
  font-weight: 600;
}

.index-hero__weights > div {
  display: grid;
  grid-template-columns: 68px 1fr 32px;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
}

.index-hero__weights label {
  color: #68778c;
  font-size: 9px;
}

.index-hero__weights div div {
  height: 4px;
  overflow: hidden;
  background: #edf2f7;
  border-radius: 4px;
}

.index-hero__weights div i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #2d7de0, #24b8ba);
  border-radius: 4px;
}

.index-hero__weights strong {
  color: #46617d;
  font-size: 9px;
  font-weight: 500;
  text-align: right;
}

.index-hero__weights small {
  display: block;
  margin-top: 13px;
  color: #a0aab8;
  font-size: 8px;
}

.index-main {
  display: grid;
  grid-template-columns: minmax(360px, 0.8fr) minmax(0, 1.2fr);
  gap: 16px;
}

.index-details {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
  gap: 16px;
}

.dimension-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dimension-name > span {
  width: 6px;
  height: 6px;
  background: #1769e0;
  border-radius: 50%;
}

.dimension-name > span.gr {
  background: #15b8c7;
}

.dimension-name > span.in {
  background: #0ba58a;
}

.dimension-name > span.ma {
  background: #e5a11a;
}

.dimension-name > span.ri {
  background: #df4f56;
}

.dimension-name strong {
  color: #34465e;
  font-size: 11px;
  font-weight: 550;
}

.quality-pill {
  padding: 2px 6px;
  color: #0a876d;
  background: #eaf8f4;
  border-radius: 4px;
  font-size: 8px;
}

.quality-pill.is-warn {
  color: #b87807;
  background: #fff7e6;
}

.dimension-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #8895a6;
  font-size: 9px;
}

.dimension-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.index-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(270px, 0.72fr);
  gap: 16px;
}

.contribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contribution-list > div {
  display: grid;
  grid-template-columns: 96px 1fr 40px;
  align-items: center;
  gap: 9px;
}

.contribution-list span {
  color: #5e6d82;
  font-size: 9.5px;
}

.contribution-list div div {
  height: 6px;
  overflow: hidden;
  background: #eef3f8;
  border-radius: 6px;
}

.contribution-list i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #2d7de0, #65b9ee);
  border-radius: 6px;
}

.contribution-list strong {
  color: #0a8a71;
  font-size: 9px;
  font-weight: 600;
  text-align: right;
}

.contribution-list.is-negative i {
  background: linear-gradient(90deg, #e47b7f, #df4f56);
}

.contribution-list.is-negative strong {
  color: #c7454c;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-list > div {
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.version-dot {
  width: 7px;
  height: 7px;
  margin-top: 4px;
  background: #c2cfdd;
  border-radius: 50%;
}

.version-dot.is-active {
  background: #0ba58a;
  box-shadow: 0 0 0 4px rgba(11, 165, 138, 0.09);
}

.version-list div div {
  min-width: 0;
  flex: 1;
}

.version-list strong,
.version-list small {
  display: block;
}

.version-list strong {
  color: #37485e;
  font-size: 9.5px;
  font-weight: 550;
}

.version-list small {
  margin-top: 2px;
  color: #929dac;
  font-size: 8px;
}

.version-list em {
  color: #8996a7;
  font-size: 8px;
  font-style: normal;
}

@media (max-width: 1150px) {
  .index-hero {
    grid-template-columns: 210px minmax(0, 1fr);
  }

  .index-hero__weights {
    display: none;
  }

  .index-main,
  .index-details {
    grid-template-columns: 1fr;
  }

  .index-bottom {
    grid-template-columns: 1fr 1fr;
  }

  .index-bottom > :last-child {
    grid-column: span 2;
  }
}

@media (max-width: 700px) {
  .index-hero {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .index-hero__score {
    padding: 0 0 18px;
    border-right: 0;
    border-bottom: 1px solid #e9eef5;
  }

  .index-hero__summary {
    padding: 17px 0 0;
  }

  .index-bottom {
    grid-template-columns: 1fr;
  }

  .index-bottom > :last-child {
    grid-column: auto;
  }
}
</style>
