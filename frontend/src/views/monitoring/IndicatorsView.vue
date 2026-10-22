<script setup lang="ts">
import { Download, Plus, Search, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import {
  dataVersion,
  heatmapValues,
  indicatorCatalog,
  indicatorSeries,
  months,
  regions,
  updatedAt,
} from '@/mock/data'
import {
  axisLabelStyle,
  axisLineStyle,
  chartTooltip,
  splitLineStyle,
} from '@/utils/charts'
import { formatNumber } from '@/utils/format'

const selectedMetrics = ref(['SC703', 'SC101', 'INN01', 'MKT01'])
const metricOptions = [
  { code: 'SC703', name: '营业收入', color: '#1769e0' },
  { code: 'SC101', name: '企业总数', color: '#15b8c7' },
  { code: 'INN01', name: '专利申请量', color: '#7d6be8' },
  { code: 'MKT01', name: '融资事件', color: '#e5a11a' },
]
const page = ref(1)
const pageSize = 6
const searchKeyword = ref('')

const filteredRows = computed(() => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return indicatorCatalog
  return indicatorCatalog.filter(
    (row) => row.name.includes(keyword) || row.code.toLowerCase().includes(keyword.toLowerCase()),
  )
})

const pagedRows = computed(() =>
  filteredRows.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)

const seriesMap: Record<string, { name: string; color: string; values: number[] }> = {
  SC703: { name: '营业收入', color: '#1769e0', values: indicatorSeries.SC703 },
  SC101: { name: '企业总数', color: '#15b8c7', values: indicatorSeries.SC101 },
  INN01: { name: '专利申请量', color: '#7d6be8', values: indicatorSeries.INN01 },
  MKT01: { name: '融资事件', color: '#e5a11a', values: indicatorSeries.MKT01 },
}

const trendOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  legend: {
    top: 0,
    right: 0,
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    textStyle: { color: '#748196', fontSize: 9 },
  },
  grid: { top: 42, left: 46, right: 45, bottom: 28 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: months.map((month) => month.slice(5)),
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: [
    {
      type: 'value',
      name: '主指标',
      nameTextStyle: { color: '#8b97a8', fontSize: 9 },
      axisLabel: axisLabelStyle,
      splitLine: splitLineStyle,
      axisLine: { show: false },
    },
    {
      type: 'value',
      name: '次指标',
      nameTextStyle: { color: '#8b97a8', fontSize: 9 },
      axisLabel: axisLabelStyle,
      splitLine: { show: false },
    },
  ],
  series: selectedMetrics.value.map((code, index) => {
    const item = seriesMap[code]
    return {
      name: item.name,
      type: 'line',
      yAxisIndex: index > 1 ? 1 : 0,
      smooth: 0.32,
      symbol: 'circle',
      symbolSize: 4,
      data: item.values,
      lineStyle: { color: item.color, width: 2 },
      itemStyle: { color: item.color, borderColor: '#fff', borderWidth: 1.5 },
    }
  }),
}))

const heatmapOption = computed<EChartsOption>(() => ({
  tooltip: {
    ...chartTooltip,
    formatter: (params: unknown) => {
      const item = params as { value: [number, number, number] }
      return `${regions[item.value[1]]?.name}<br/>活跃度：${item.value[2]}`
    },
  },
  grid: { top: 10, left: 58, right: 20, bottom: 58 },
  xAxis: {
    type: 'category',
    data: months.slice(6).map((item) => item.slice(5)),
    splitArea: { show: true },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'category',
    data: regions.map((item) => item.name),
    inverse: true,
    splitArea: { show: true },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  visualMap: {
    min: 30,
    max: 95,
    calculable: false,
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    itemWidth: 10,
    itemHeight: 100,
    textStyle: { color: '#8491a3', fontSize: 8 },
    inRange: { color: ['#eef5fd', '#b8d6f6', '#6fa9e5', '#1769e0'] },
  },
  series: [
    {
      type: 'heatmap',
      data: heatmapValues,
      label: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 4 },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(23,105,224,0.22)' } },
    },
  ],
}))

function addMetric(code: string) {
  if (!selectedMetrics.value.includes(code)) {
    selectedMetrics.value.push(code)
  }
}

function exportData() {
  ElMessage.success('多维指标数据导出任务已创建，当前筛选条件将随任务保存')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="多维指标"
      description="从产业、地区、园区、企业和时间等维度组合查询指标，联动查看趋势、热力分布、区域排名与指标明细。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Setting">指标设置</el-button>
        <el-button :icon="Download" @click="exportData">导出结果</el-button>
        <el-button type="primary" :icon="Plus" @click="ElMessage.info('可将当前查询保存为分析结果')">
          保存查询
        </el-button>
      </template>
    </PageHeader>

    <FilterBar label="分析维度">
      <el-select model-value="人工智能" style="width: 140px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
      </el-select>
      <el-select model-value="全市" style="width: 115px">
        <el-option label="全市" value="全市" />
        <el-option label="海淀区" value="海淀区" />
      </el-select>
      <el-select model-value="月度" style="width: 105px">
        <el-option label="月度" value="月度" />
        <el-option label="季度" value="季度" />
        <el-option label="年度" value="年度" />
      </el-select>
      <el-date-picker model-value="近12个月" type="daterange" style="width: 220px" />
      <template #extra>
        <span class="status-line"><span class="inline-dot" />指标口径版本 V3.2</span>
      </template>
    </FilterBar>

    <div class="indicator-layout">
      <aside class="metric-basket">
        <div class="metric-basket__head">
          <div>
            <strong>指标篮</strong>
            <span>已选 {{ selectedMetrics.length }} 项</span>
          </div>
          <el-button text size="small">清空</el-button>
        </div>
        <el-input v-model="searchKeyword" placeholder="搜索指标" :prefix-icon="Search" size="small" />
        <div class="metric-group">
          <span class="metric-group__title">产业规模</span>
          <label
            v-for="item in metricOptions.slice(0, 2)"
            :key="item.code"
            class="metric-option"
            :class="{ 'is-selected': selectedMetrics.includes(item.code) }"
          >
            <el-checkbox-group v-model="selectedMetrics">
              <el-checkbox :value="item.code">{{ item.name }}</el-checkbox>
            </el-checkbox-group>
            <i :style="{ background: item.color }" />
          </label>
        </div>
        <div class="metric-group">
          <span class="metric-group__title">创新与市场</span>
          <label
            v-for="item in metricOptions.slice(2)"
            :key="item.code"
            class="metric-option"
            :class="{ 'is-selected': selectedMetrics.includes(item.code) }"
          >
            <el-checkbox-group v-model="selectedMetrics">
              <el-checkbox :value="item.code">{{ item.name }}</el-checkbox>
            </el-checkbox-group>
            <i :style="{ background: item.color }" />
          </label>
        </div>
        <button class="metric-add" type="button" @click="addMetric('MKT01')">
          <el-icon><Plus /></el-icon>
          从指标目录添加
        </button>
        <div class="metric-note">
          <strong>口径提示</strong>
          <p>企业总数按注册且正常经营企业去重统计，含分支机构归属调整。</p>
        </div>
      </aside>

      <div class="indicator-main">
        <DataCard title="指标趋势" subtitle="所选指标的近 12 个月变化">
          <template #actions>
            <el-radio-group model-value="绝对值" size="small">
              <el-radio-button value="绝对值">绝对值</el-radio-button>
              <el-radio-button value="同比">同比</el-radio-button>
              <el-radio-button value="环比">环比</el-radio-button>
            </el-radio-group>
          </template>
          <BaseChart :option="trendOption" height="326px" />
        </DataCard>

        <div class="indicator-lower">
          <DataCard title="区域活跃度热力图" subtitle="按月份与区域展示指标综合活跃度">
            <BaseChart :option="heatmapOption" height="312px" />
          </DataCard>
          <DataCard title="区域排名" subtitle="按综合活跃度">
            <div class="ranking-list">
              <div v-for="(region, index) in regions.slice(0, 6)" :key="region.name">
                <span class="rank-no" :class="{ 'is-top': index < 3 }">{{ index + 1 }}</span>
                <div class="rank-main">
                  <div>
                    <strong>{{ region.name }}</strong>
                    <span>{{ formatNumber(region.enterprises) }} 家企业</span>
                  </div>
                  <div class="rank-bar"><i :style="{ width: `${region.value}%` }" /></div>
                </div>
                <b>{{ region.value.toFixed(1) }}</b>
              </div>
            </div>
          </DataCard>
        </div>
      </div>
    </div>

    <DataCard title="指标明细" subtitle="同口径汇总值与同比、环比">
      <template #actions>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索指标名称或编码"
          :prefix-icon="Search"
          size="small"
          style="width: 200px"
        />
      </template>
      <el-table :data="pagedRows">
        <el-table-column prop="code" label="指标编码" width="105">
          <template #default="{ row }"><span class="mono code-cell">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="指标名称" min-width="150" />
        <el-table-column label="当前值" width="125" align="right">
          <template #default="{ row }"><b>{{ formatNumber(row.value) }}</b> {{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="同比" width="90" align="right">
          <template #default="{ row }">
            <span :class="row.yoy >= 0 ? 'text-up' : 'text-down'">
              {{ row.yoy > 0 ? '+' : '' }}{{ row.yoy }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="环比" width="90" align="right">
          <template #default="{ row }">
            <span :class="row.mom >= 0 ? 'text-up' : 'text-down'">
              {{ row.mom > 0 ? '+' : '' }}{{ row.mom }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="数据来源" min-width="130" />
        <el-table-column label="质量" width="100">
          <template #default="{ row }">
            <span class="quality-tag" :class="{ 'is-warn': row.quality !== '正常' }">
              {{ row.quality }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="82" align="right">
          <template #default>
            <el-button text size="small" @click="ElMessage.info('已打开指标口径详情')">口径</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <PaginationBar
          :page="page"
          :size="pageSize"
          :total="filteredRows.length"
          @update:page="page = $event"
        />
      </template>
    </DataCard>

    <div class="data-footnote">
      <span>指标查询已应用授权范围，无权限字段不返回、不展示。</span>
      <span>图表与明细共享同一查询版本；最后更新时间 {{ updatedAt }}。</span>
    </div>
  </div>
</template>

<style scoped>
.indicator-layout {
  display: grid;
  grid-template-columns: 238px minmax(0, 1fr);
  gap: 16px;
}

.metric-basket {
  align-self: start;
  padding: 15px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.metric-basket__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.metric-basket__head strong,
.metric-basket__head span {
  display: block;
}

.metric-basket__head strong {
  color: #2e4059;
  font-size: 13px;
  font-weight: 600;
}

.metric-basket__head span {
  margin-top: 2px;
  color: #8e9aaa;
  font-size: 8px;
}

.metric-group {
  margin-top: 14px;
}

.metric-group__title {
  display: block;
  margin-bottom: 5px;
  color: #8b97a7;
  font-size: 9px;
  font-weight: 600;
}

.metric-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 5px;
  border-radius: 5px;
}

.metric-option:hover,
.metric-option.is-selected {
  background: #f4f8fd;
}

.metric-option :deep(.el-checkbox__label) {
  color: #58687d;
  font-size: 10px;
}

.metric-option > i {
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
}

.metric-add {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px;
  margin-top: 14px;
  color: #587697;
  background: #f7fafd;
  border: 1px dashed #d6e1ed;
  border-radius: 6px;
  font-size: 9px;
  cursor: pointer;
}

.metric-note {
  padding: 10px;
  margin-top: 14px;
  background: #f8fafc;
  border-radius: 6px;
}

.metric-note strong {
  color: #65758a;
  font-size: 9px;
}

.metric-note p {
  margin: 4px 0 0;
  color: #929dad;
  font-size: 8px;
  line-height: 1.6;
}

.indicator-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.indicator-lower {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
  gap: 16px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-list > div {
  display: flex;
  align-items: center;
  gap: 9px;
}

.rank-no {
  display: flex;
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #8190a3;
  background: #f1f4f8;
  border-radius: 5px;
  font-size: 8px;
}

.rank-no.is-top {
  color: #1769e0;
  background: #ebf3fe;
}

.rank-main {
  min-width: 0;
  flex: 1;
}

.rank-main > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  margin-bottom: 5px;
}

.rank-main strong {
  color: #43536a;
  font-size: 9.5px;
  font-weight: 550;
}

.rank-main span {
  color: #939eae;
  font-size: 8px;
}

.rank-bar {
  height: 4px;
  overflow: hidden;
  background: #eef2f7;
  border-radius: 4px;
}

.rank-bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #5c9be3, #1769e0);
  border-radius: 4px;
}

.ranking-list b {
  color: #52647a;
  font-size: 9px;
  font-weight: 600;
}

.code-cell {
  color: #57789b;
  font-size: 9px;
}

.quality-tag {
  padding: 2px 6px;
  color: #0a876d;
  background: #eaf8f4;
  border-radius: 4px;
  font-size: 8px;
}

.quality-tag.is-warn {
  color: #ae750e;
  background: #fff7e8;
}

@media (max-width: 1120px) {
  .indicator-layout {
    grid-template-columns: 1fr;
  }

  .metric-basket {
    display: grid;
    grid-template-columns: 1.1fr 1fr 1fr;
    gap: 0 14px;
  }

  .metric-basket__head,
  .metric-basket > .el-input,
  .metric-add,
  .metric-note {
    grid-column: span 3;
  }
}

@media (max-width: 820px) {
  .metric-basket {
    display: block;
  }

  .indicator-lower {
    grid-template-columns: 1fr;
  }
}
</style>
