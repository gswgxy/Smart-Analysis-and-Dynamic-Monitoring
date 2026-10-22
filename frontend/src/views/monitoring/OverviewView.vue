<script setup lang="ts">
import {
  Download,
  MagicStick,
  Money,
  OfficeBuilding,
  Refresh,
  TrendCharts,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import {
  dataVersion,
  keyEnterprises,
  months,
  overviewTrend,
  regions,
  riskRecords,
  updatedAt,
} from '@/mock/data'
import {
  axisLabelStyle,
  axisLineStyle,
  chartTooltip,
  splitLineStyle,
} from '@/utils/charts'
import { formatNumber } from '@/utils/format'

const router = useRouter()
const industry = ref('人工智能')
const region = ref('全市')
const compare = ref('同比 + 环比')
const refreshing = ref(false)

const trendOption = computed<EChartsOption>(() => ({
  tooltip: {
    ...chartTooltip,
    trigger: 'axis',
    axisPointer: { type: 'line', lineStyle: { color: '#bdcbd9', type: 'dashed' } },
  },
  legend: {
    right: 0,
    top: 0,
    itemWidth: 9,
    itemHeight: 9,
    textStyle: { color: '#728096', fontSize: 10 },
  },
  grid: { top: 40, left: 45, right: 45, bottom: 28 },
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
      name: '亿元',
      nameTextStyle: { color: '#8a97a9', fontSize: 9 },
      axisLabel: axisLabelStyle,
      splitLine: splitLineStyle,
      axisLine: { show: false },
    },
    {
      type: 'value',
      name: '件',
      nameTextStyle: { color: '#8a97a9', fontSize: 9 },
      axisLabel: axisLabelStyle,
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '营业收入',
      type: 'line',
      smooth: 0.35,
      symbolSize: 5,
      data: overviewTrend.revenue,
      lineStyle: { color: '#1769e0', width: 2.5 },
      itemStyle: { color: '#1769e0', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(23,105,224,0.18)' },
            { offset: 1, color: 'rgba(23,105,224,0.01)' },
          ],
        },
      },
    },
    {
      name: '专利申请量',
      type: 'line',
      yAxisIndex: 1,
      smooth: 0.35,
      symbol: 'none',
      data: overviewTrend.patents,
      lineStyle: { color: '#15b8c7', width: 1.8 },
    },
  ],
}))

const chainOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: 6, right: 30, bottom: 10, left: 82 },
  xAxis: {
    type: 'value',
    max: 100,
    axisLabel: { ...axisLabelStyle, formatter: '{value}%' },
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: ['基础层', '技术层', '模型层', '应用层', '生态服务'],
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: { color: '#5e6c81', fontSize: 10 },
  },
  series: [
    {
      type: 'bar',
      barWidth: 12,
      data: [
        { value: 62, itemStyle: { color: '#5a8fd8' } },
        { value: 74, itemStyle: { color: '#1769e0' } },
        { value: 81, itemStyle: { color: '#15b8c7' } },
        { value: 93, itemStyle: { color: '#0ba58a' } },
        { value: 57, itemStyle: { color: '#7d6be8' } },
      ],
      showBackground: true,
      backgroundStyle: { color: '#f0f4f9', borderRadius: 8 },
      itemStyle: { borderRadius: 8 },
      label: { show: true, position: 'right', color: '#7e8b9e', fontSize: 9, formatter: '{c}%' },
    },
  ],
}))

const districtBubbles = computed(() =>
  regions.slice(0, 6).map((item, index) => ({
    ...item,
    size: 50 + Math.round(item.value * 0.62),
    left: [6, 30, 55, 18, 47, 70][index],
    top: [8, 12, 8, 48, 52, 47][index],
  })),
)

function refresh() {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    ElMessage.success('总览数据已刷新')
  }, 500)
}

function createExport() {
  ElMessage.success('总览导出任务已创建，可在导出中心查看')
  router.push('/reports/exports')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="产业运行总览"
      description="从规模、成长、创新、资本与风险五个视角快速判断产业运行状态，并下钻到区域、企业和产业链节点。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Refresh" :loading="refreshing" @click="refresh">刷新</el-button>
        <el-button :icon="Download" @click="createExport">导出总览</el-button>
        <el-button type="primary" :icon="MagicStick" @click="router.push('/analysis/qa')">
          智能解读
        </el-button>
      </template>
    </PageHeader>

    <FilterBar label="监测条件">
      <el-select v-model="industry" style="width: 150px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
        <el-option label="智能网联汽车" value="智能网联汽车" />
      </el-select>
      <el-select v-model="region" style="width: 125px">
        <el-option label="全市" value="全市" />
        <el-option v-for="item in regions" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <el-date-picker model-value="2026-10" type="month" style="width: 140px" />
      <el-select v-model="compare" style="width: 160px">
        <el-option label="同比 + 环比" value="同比 + 环比" />
        <el-option label="与全市均值比较" value="与全市均值比较" />
        <el-option label="与目标值比较" value="与目标值比较" />
      </el-select>
      <el-select model-value="企业注册地" style="width: 130px">
        <el-option label="企业注册地" value="企业注册地" />
        <el-option label="企业经营地" value="企业经营地" />
        <el-option label="园区归属" value="园区归属" />
      </el-select>
      <template #extra>
        <span class="filter-note">已授权数据源 12 / 12</span>
      </template>
    </FilterBar>

    <section class="overview-insight">
      <div class="overview-insight__mark">AI</div>
      <div class="overview-insight__copy">
        <span>一句话结论</span>
        <strong>
          本月人工智能产业规模同比增长 12.4%，创新活力继续提升，风险安全指数略有下降，
          AI 芯片供应集中度是需要关注的主要变量。
        </strong>
      </div>
      <div class="overview-insight__quality">
        <div><span>数据完整性</span><strong>98.7%</strong></div>
        <div><span>指标版本</span><strong>V3.2</strong></div>
        <div><span>分析可信度</span><strong>B</strong></div>
      </div>
    </section>

    <div class="grid-4">
      <MetricCard label="综合景气指数" :value="128.6" :delta="0.9" hint="景气区间" accent="#1769e0">
        <template #icon><el-icon><TrendCharts /></el-icon></template>
      </MetricCard>
      <MetricCard label="企业总数" value="4,286" unit="家" :delta="1.3" accent="#15b8c7">
        <template #icon><el-icon><OfficeBuilding /></el-icon></template>
      </MetricCard>
      <MetricCard label="营业收入" value="418.2" unit="亿元" :delta="12.4" accent="#0ba58a">
        <template #icon><el-icon><Money /></el-icon></template>
      </MetricCard>
      <MetricCard label="风险预警" value="8" unit="条" :delta="14.3" delta-label="风险较上期" risk accent="#df4f56">
        <template #icon><el-icon><Warning /></el-icon></template>
      </MetricCard>
    </div>

    <div class="grid-4 compact-metrics">
      <MetricCard label="规上企业数" value="682" unit="家" :delta="2.1" accent="#5a8fd8" />
      <MetricCard label="从业人数" :value="formatNumber(268420)" unit="人" :delta="6.2" accent="#7d6be8" />
      <MetricCard label="专利申请量" value="1,084" unit="件" :delta="21.7" accent="#15b8c7" />
      <MetricCard label="融资事件" value="38" unit="起" :delta="-4.1" accent="#e5a11a" />
    </div>

    <div class="overview-charts">
      <DataCard title="产业规模与创新趋势" subtitle="近 12 个月营业收入及专利申请量">
        <BaseChart :option="trendOption" height="310px" />
      </DataCard>

      <DataCard title="区域产业分布" subtitle="按综合发展指数呈现，点击区域查看详情">
        <template #actions>
          <el-button text size="small" @click="router.push('/monitoring/regions')">区域监测</el-button>
        </template>
        <div class="district-map">
          <div class="district-map__grid" />
          <button
            v-for="item in districtBubbles"
            :key="item.name"
            type="button"
            class="district-bubble"
            :style="{
              width: `${item.size}px`,
              height: `${item.size}px`,
              left: `${item.left}%`,
              top: `${item.top}%`,
              '--intensity': item.value / 100,
            }"
            @click="router.push('/monitoring/regions')"
          >
            <strong>{{ item.name }}</strong>
            <span>{{ item.value.toFixed(1) }}</span>
          </button>
          <div class="district-map__legend">
            <span><i class="is-high" />高集聚</span>
            <span><i class="is-mid" />中集聚</span>
            <span><i class="is-low" />一般</span>
          </div>
          <div class="district-map__note">示意图 · 非 GIS 精确边界</div>
        </div>
      </DataCard>
    </div>

    <div class="overview-lower">
      <DataCard title="产业链结构" subtitle="各环节企业活跃度指数">
        <BaseChart :option="chainOption" height="250px" />
      </DataCard>
      <DataCard title="风险摘要" subtitle="2 条高风险、1 条重大风险待处置">
        <template #actions>
          <el-button text size="small" @click="router.push('/monitoring/risks')">全部风险</el-button>
        </template>
        <div class="risk-summary-grid">
          <div><span>新增风险</span><strong>3</strong><em>近 7 天</em></div>
          <div><span>高风险企业</span><strong>2</strong><em>较上周 +1</em></div>
          <div><span>高风险节点</span><strong>3</strong><em>涉及 2 条链路</em></div>
        </div>
        <div class="risk-brief-list">
          <button
            v-for="risk in riskRecords.slice(0, 3)"
            :key="risk.id"
            type="button"
            @click="router.push(`/monitoring/risks/${risk.id}`)"
          >
            <RiskTag :level="risk.level" compact />
            <span>{{ risk.title }}</span>
            <small>{{ risk.detectedAt.slice(5, 10) }}</small>
          </button>
        </div>
      </DataCard>
    </div>

    <DataCard title="重点企业" subtitle="综合营收、成长性与风险变化排序">
      <template #actions>
        <el-button text size="small" @click="router.push('/monitoring/enterprises')">
          企业画像
        </el-button>
      </template>
      <el-table :data="keyEnterprises">
        <el-table-column prop="name" label="企业名称" min-width="210">
          <template #default="{ row }">
            <button class="table-link" type="button" @click="router.push('/monitoring/enterprises')">
              {{ row.name }}
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="sector" label="细分领域" width="130" />
        <el-table-column prop="region" label="区域" width="95" />
        <el-table-column label="营业收入" width="115" align="right">
          <template #default="{ row }">{{ row.revenue.toFixed(1) }} 亿元</template>
        </el-table-column>
        <el-table-column label="同比" width="90" align="right">
          <template #default="{ row }"><span class="text-up">+{{ row.growth }}%</span></template>
        </el-table-column>
        <el-table-column prop="patents" label="专利" width="85" align="right" />
        <el-table-column label="标签" width="110">
          <template #default="{ row }"><span class="tag-soft">{{ row.tag }}</span></template>
        </el-table-column>
        <el-table-column label="风险" width="90" align="center">
          <template #default="{ row }"><RiskTag :level="row.risk" compact /></template>
        </el-table-column>
      </el-table>
    </DataCard>

    <div class="data-footnote">
      <span>数据来源：企业主数据、企业财报、知识产权库、融资事件库、风险监测模型。</span>
      <span>说明：部分数据为前端演示数据，接入 B / C 模块后由接口替换。</span>
    </div>
  </div>
</template>

<style scoped>
.filter-note {
  padding: 4px 8px;
  color: #5680a9;
  background: #eff5fc;
  border-radius: 5px;
  font-size: 10px;
}

.overview-insight {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  background: linear-gradient(90deg, #f4f9ff, #f8fbff);
  border: 1px solid #dfe9f7;
  border-radius: 12px;
}

.overview-insight__mark {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  background: #e6f0ff;
  border-radius: 9px;
  font-family: Georgia, serif;
  font-size: 11px;
  font-weight: 600;
}

.overview-insight__copy {
  min-width: 0;
  flex: 1;
}

.overview-insight__copy span {
  display: block;
  margin-bottom: 3px;
  color: #7890aa;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.overview-insight__copy strong {
  color: #2e4763;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.65;
}

.overview-insight__quality {
  display: flex;
  flex-shrink: 0;
  gap: 20px;
  padding-left: 18px;
  border-left: 1px solid #dfe9f5;
}

.overview-insight__quality div {
  text-align: right;
}

.overview-insight__quality span,
.overview-insight__quality strong {
  display: block;
}

.overview-insight__quality span {
  color: #8c99ab;
  font-size: 8px;
}

.overview-insight__quality strong {
  margin-top: 3px;
  color: #385878;
  font-size: 11px;
  font-weight: 600;
}

.compact-metrics :deep(.metric-card) {
  padding-top: 13px;
  padding-bottom: 12px;
}

.compact-metrics :deep(.metric-card__value span) {
  font-size: 23px;
}

.overview-charts {
  display: grid;
  grid-template-columns: minmax(0, 1.34fr) minmax(360px, 0.66fr);
  gap: 16px;
}

.district-map {
  position: relative;
  height: 310px;
  overflow: hidden;
  background:
    radial-gradient(circle at 48% 40%, rgba(23, 105, 224, 0.07), transparent 43%),
    #f8fbfe;
  border-radius: 9px;
}

.district-map__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(87, 131, 174, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(87, 131, 174, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(circle at 50% 48%, #000, transparent 75%);
}

.district-bubble {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #1d588e;
  background: rgba(83, 153, 225, calc(0.08 + var(--intensity) * 0.16));
  border: 1px solid rgba(23, 105, 224, calc(0.2 + var(--intensity) * 0.3));
  border-radius: 50%;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.district-bubble:hover {
  z-index: 2;
  box-shadow: 0 8px 20px rgba(23, 105, 224, 0.16);
  transform: translate(-50%, -50%) scale(1.06);
}

.district-bubble strong {
  font-size: 10px;
  font-weight: 600;
}

.district-bubble span {
  margin-top: 2px;
  color: #5381ae;
  font-size: 9px;
}

.district-map__legend {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  gap: 9px;
  padding: 6px 8px;
  color: #7d8a9c;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid #e7edf4;
  border-radius: 6px;
  font-size: 8px;
  backdrop-filter: blur(5px);
}

.district-map__legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.district-map__legend i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.is-high {
  background: #1769e0;
}

.is-mid {
  background: #6ea8df;
}

.is-low {
  background: #b6d1e9;
}

.district-map__note {
  position: absolute;
  bottom: 14px;
  left: 13px;
  color: #9aa5b4;
  font-size: 8px;
}

.overview-lower {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(380px, 0.9fr);
  gap: 16px;
}

.risk-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin-bottom: 12px;
  overflow: hidden;
  background: #e7edf5;
  border: 1px solid #e7edf5;
  border-radius: 8px;
}

.risk-summary-grid div {
  padding: 11px;
  background: #f9fbfd;
}

.risk-summary-grid span,
.risk-summary-grid strong,
.risk-summary-grid em {
  display: block;
}

.risk-summary-grid span {
  color: #8390a3;
  font-size: 8px;
}

.risk-summary-grid strong {
  margin: 3px 0 1px;
  color: #273c56;
  font-size: 22px;
  font-weight: 620;
}

.risk-summary-grid em {
  color: #9aa4b2;
  font-size: 8px;
  font-style: normal;
}

.risk-brief-list {
  display: flex;
  flex-direction: column;
}

.risk-brief-list button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 1px;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #eef2f6;
  cursor: pointer;
}

.risk-brief-list button:last-child {
  border-bottom: 0;
}

.risk-brief-list button span {
  overflow: hidden;
  flex: 1;
  color: #45556b;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-brief-list small {
  color: #929dad;
  font-size: 8px;
}

.table-link {
  padding: 0;
  color: #315f8e;
  background: transparent;
  border: 0;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.table-link:hover {
  color: var(--dip-blue);
}

@media (max-width: 1150px) {
  .overview-charts,
  .overview-lower {
    grid-template-columns: 1fr;
  }

  .overview-insight {
    align-items: flex-start;
  }

  .overview-insight__quality {
    display: none;
  }
}

@media (max-width: 640px) {
  .overview-insight {
    padding: 13px;
  }

  .overview-insight__mark {
    display: none;
  }
}
</style>
