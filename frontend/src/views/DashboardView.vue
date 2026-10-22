<script setup lang="ts">
import {
  ArrowRight,
  DataAnalysis,
  DocumentAdd,
  Money,
  OfficeBuilding,
  Refresh,
  TrendCharts,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { monitoringApi } from '@/api/monitoring'
import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import {
  dataVersion,
  indexTrend,
  keyEnterprises,
  months,
  overviewTrend,
  riskRecords,
  updatedAt,
} from '@/mock/data'
import { useAuthStore } from '@/stores/auth'
import {
  axisLabelStyle,
  axisLineStyle,
  chartTooltip,
  splitLineStyle,
} from '@/utils/charts'
import { formatNumber, greeting, riskLabel } from '@/utils/format'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const enterpriseCount = ref(4286)
const riskCount = ref(8)
const integrationMessage = ref('后端监测接口已连通')

const dateLabel = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

const quickLinks = [
  { title: '运行总览', desc: '核心指标与风险摘要', path: '/monitoring/overview', icon: 'OV' },
  { title: '智能问答', desc: '用自然语言查询产业', path: '/analysis/qa', icon: 'AI' },
  { title: '风险图谱', desc: '定位节点与传导路径', path: '/monitoring/chain-graph', icon: 'GR' },
  { title: '生成报告', desc: '从分析结果生成初稿', path: '/reports/generate', icon: 'RP' },
]

const trendOption = computed<EChartsOption>(() => ({
  tooltip: {
    ...chartTooltip,
    trigger: 'axis',
    axisPointer: { type: 'line', lineStyle: { color: '#b9c9dc', type: 'dashed' } },
  },
  legend: {
    top: 0,
    right: 0,
    itemWidth: 9,
    itemHeight: 9,
    textStyle: { color: '#748196', fontSize: 10 },
  },
  grid: { top: 42, right: 48, bottom: 28, left: 46 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: months.map((month) => month.slice(5)),
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: { ...axisLabelStyle, margin: 12 },
  },
  yAxis: [
    {
      type: 'value',
      name: '营收 / 亿元',
      nameTextStyle: { color: '#8895a8', fontSize: 10, align: 'left' },
      axisLabel: axisLabelStyle,
      splitLine: splitLineStyle,
      axisLine: { show: false },
    },
    {
      type: 'value',
      name: '指数',
      nameTextStyle: { color: '#8895a8', fontSize: 10, align: 'right' },
      min: 105,
      max: 140,
      axisLabel: axisLabelStyle,
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '营业收入',
      type: 'line',
      smooth: 0.35,
      symbol: 'circle',
      symbolSize: 5,
      data: overviewTrend.revenue,
      lineStyle: { width: 2.4, color: '#1769e0' },
      itemStyle: { color: '#1769e0', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(23,105,224,0.20)' },
            { offset: 1, color: 'rgba(23,105,224,0.01)' },
          ],
        },
      },
    },
    {
      name: '景气指数',
      type: 'line',
      yAxisIndex: 1,
      smooth: 0.35,
      symbol: 'none',
      data: indexTrend,
      lineStyle: { width: 1.8, color: '#15b8c7', type: 'dashed' },
    },
  ],
}))

const riskOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'item' },
  legend: {
    bottom: 0,
    left: 'center',
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    textStyle: { color: '#78859a', fontSize: 10 },
  },
  series: [
    {
      type: 'pie',
      radius: ['55%', '74%'],
      center: ['50%', '43%'],
      startAngle: 90,
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      emphasis: { scale: true, scaleSize: 4 },
      data: [
        { value: 1, name: '重大风险', itemStyle: { color: '#df4f56' } },
        { value: 2, name: '高风险', itemStyle: { color: '#e57431' } },
        { value: 3, name: '较高风险', itemStyle: { color: '#e5a11a' } },
        { value: 2, name: '一般风险', itemStyle: { color: '#5a8fd8' } },
      ],
    },
  ],
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: '34%',
      style: {
        text: '8',
        fill: '#17243b',
        fontSize: 26,
        fontWeight: 650,
        textAlign: 'center',
      },
    },
    {
      type: 'text',
      left: 'center',
      top: '48%',
      style: {
        text: '风险预警',
        fill: '#8b97a8',
        fontSize: 10,
        textAlign: 'center',
      },
    },
  ],
}))

const chainOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: 10, right: 14, bottom: 10, left: 72 },
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
    data: ['基础大模型', 'AI 芯片', '智能驾驶', '工业机器人', '数据服务'],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#5e6c81', fontSize: 10 },
  },
  series: [
    {
      type: 'bar',
      data: [
        { value: 86, itemStyle: { color: '#1769e0' } },
        { value: 72, itemStyle: { color: '#df4f56' } },
        { value: 81, itemStyle: { color: '#15b8c7' } },
        { value: 64, itemStyle: { color: '#e5a11a' } },
        { value: 58, itemStyle: { color: '#7d6be8' } },
      ],
      barWidth: 9,
      showBackground: true,
      backgroundStyle: { color: '#f0f4f8', borderRadius: 6 },
      itemStyle: { borderRadius: 6 },
      label: {
        show: true,
        position: 'right',
        color: '#77859a',
        fontSize: 9,
        formatter: '{c}%',
      },
    },
  ],
}))

const taskItems = [
  { title: '审核 AI 芯片供应链风险专题', tag: '专家审核', due: '今日 20:00', level: '高' },
  { title: '确认 EDA 断供风险处置方案', tag: '风险处置', due: '今日 18:00', level: '紧急' },
  { title: '补充人工智能产业月报证据', tag: '报告编辑', due: '明日 12:00', level: '中' },
  { title: '校验专利数据源月度同步结果', tag: '数据治理', due: '10-21', level: '低' },
]

const recentAnalyses = [
  { title: '人工智能产业运行趋势', type: '指标分析', time: '12 分钟前', owner: '张研', trust: 'A' },
  { title: 'AI 芯片供应链风险传导', type: '风险研判', time: '1 小时前', owner: '李析', trust: 'B' },
  { title: '中关村企业集聚度对比', type: '区域分析', time: '3 小时前', owner: '王园', trust: 'B' },
]

async function refresh() {
  loading.value = true
  try {
    const result = await monitoringApi.overview()
    enterpriseCount.value = result.metrics?.enterpriseCount ?? enterpriseCount.value
    riskCount.value = result.metrics?.riskCount ?? riskCount.value
    integrationMessage.value = `后端监测接口已连通 · ${result.currentUser}`
  } catch {
    integrationMessage.value = '后端接口暂不可用，当前展示本地演示数据'
  } finally {
    loading.value = false
  }
}

function exportDashboard() {
  ElMessage.success('工作台快照导出任务已创建，可在导出中心查看进度')
  router.push('/reports/exports')
}

onMounted(refresh)
</script>

<template>
  <div class="page-shell dashboard-page">
    <PageHeader
      title="业务工作台"
      description="汇集重点指标、风险动态、协同任务与最近分析，作为进入各项业务的统一入口。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #badge>
        <span class="live-badge"><i /> 实时联动</span>
      </template>
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="refresh">刷新数据</el-button>
        <el-button type="primary" :icon="DocumentAdd" @click="exportDashboard">导出快照</el-button>
      </template>
    </PageHeader>

    <section class="welcome-banner">
      <div class="welcome-banner__copy">
        <div class="welcome-banner__date">{{ dateLabel }}</div>
        <h2>{{ greeting() }}，{{ auth.displayName }}</h2>
        <p>
          人工智能产业保持扩张，创新活力连续三个月提升；AI 芯片供应集中度升至 68%，
          建议关注算力扩容与重点企业供应保障。
        </p>
        <div class="welcome-banner__status">
          <span><i class="inline-dot" /> {{ integrationMessage }}</span>
          <span>数据完整性 98.7%</span>
        </div>
      </div>
      <div class="welcome-banner__index">
        <span>综合景气指数</span>
        <strong>128.6</strong>
        <em>景气区间 · 环比 +0.9</em>
        <div class="index-scale">
          <span class="index-scale__mark" style="left: 72%" />
        </div>
        <div class="index-scale__labels"><span>收缩</span><span>平稳</span><span>景气</span></div>
      </div>
      <div class="welcome-banner__quick">
        <button
          v-for="item in quickLinks"
          :key="item.path"
          type="button"
          @click="router.push(item.path)"
        >
          <span class="quick-icon">{{ item.icon }}</span>
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.desc }}</small>
          </span>
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </section>

    <FilterBar label="查看范围">
      <el-select model-value="人工智能" style="width: 148px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
        <el-option label="智能网联汽车" value="智能网联汽车" />
      </el-select>
      <el-select model-value="全市" style="width: 126px">
        <el-option label="全市" value="全市" />
        <el-option label="海淀区" value="海淀区" />
        <el-option label="经开区" value="经开区" />
      </el-select>
      <el-date-picker
        model-value="2026-10"
        type="month"
        placeholder="选择月份"
        style="width: 142px"
      />
      <template #extra>
        <span class="status-line"><span class="inline-dot" />口径：企业注册地</span>
      </template>
    </FilterBar>

    <div class="grid-4 metrics-grid">
      <MetricCard
        label="综合景气指数"
        :value="128.6"
        :delta="0.9"
        hint="景气区间"
        accent="#1769e0"
      >
        <template #icon><el-icon><TrendCharts /></el-icon></template>
      </MetricCard>
      <MetricCard
        label="监测企业总数"
        :value="formatNumber(enterpriseCount)"
        unit="家"
        :delta="1.3"
        accent="#15b8c7"
      >
        <template #icon><el-icon><OfficeBuilding /></el-icon></template>
      </MetricCard>
      <MetricCard
        label="产业营业收入"
        value="418.2"
        unit="亿元"
        :delta="12.4"
        accent="#0ba58a"
      >
        <template #icon><el-icon><Money /></el-icon></template>
      </MetricCard>
      <MetricCard
        label="风险预警"
        :value="riskCount"
        unit="条"
        :delta="14.3"
        delta-label="风险较上期"
        hint="2 条高风险"
        accent="#df4f56"
        risk
      >
        <template #icon><el-icon><Warning /></el-icon></template>
      </MetricCard>
    </div>

    <div class="dashboard-main">
      <DataCard
        title="产业运行趋势"
        subtitle="近 12 个月营业收入与综合景气指数走势"
        :padded="false"
      >
        <template #actions>
          <el-radio-group model-value="12个月" size="small">
            <el-radio-button value="12个月">12 个月</el-radio-button>
            <el-radio-button value="季度">季度</el-radio-button>
          </el-radio-group>
        </template>
        <div class="chart-pad">
          <BaseChart :option="trendOption" height="286px" :loading="loading" />
        </div>
        <template #footer>
          <div class="chart-insight">
            <span class="chart-insight__mark">观察</span>
            营收连续 4 个月保持增长，9 月单月环比增速回落 1.2 个百分点，需结合订单数据继续观察。
          </div>
        </template>
      </DataCard>

      <DataCard title="今日关注" subtitle="按风险等级与业务影响排序">
        <template #actions>
          <el-button text size="small" @click="router.push('/monitoring/risks')">
            全部预警
          </el-button>
        </template>
        <div class="focus-list">
          <button
            v-for="item in riskRecords.slice(0, 4)"
            :key="item.id"
            type="button"
            class="focus-item"
            @click="router.push(`/monitoring/risks/${item.id}`)"
          >
            <div class="focus-item__line">
              <RiskTag :level="item.level" :compact="true" />
              <span>{{ item.type }}</span>
              <time>{{ item.detectedAt.slice(5, 16) }}</time>
            </div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.enterprise }} · {{ item.region }}</p>
          </button>
        </div>
      </DataCard>
    </div>

    <div class="grid-3 dashboard-secondary">
      <DataCard title="风险等级分布" subtitle="当前未关闭风险事件">
        <BaseChart :option="riskOption" height="242px" />
        <template #footer>
          <div class="card-footer-line">
            <span>重大风险较上周新增 1 条</span>
            <el-button text size="small" @click="router.push('/monitoring/risks')">
              查看清单
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>
      </DataCard>

      <DataCard title="产业链活跃度" subtitle="重点环节企业活跃度指数">
        <BaseChart :option="chainOption" height="242px" />
        <template #footer>
          <div class="card-footer-line">
            <span>基础大模型活跃度领先</span>
            <el-button text size="small" @click="router.push('/analysis/chain')">
              产业分析
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>
      </DataCard>

      <DataCard title="我的待办" subtitle="4 项任务等待处理">
        <template #actions>
          <el-button text size="small">全部待办</el-button>
        </template>
        <div class="task-list">
          <div v-for="task in taskItems" :key="task.title" class="task-item">
            <span class="task-item__dot" :class="{ 'is-urgent': ['紧急', '高'].includes(task.level) }" />
            <div>
              <strong>{{ task.title }}</strong>
              <span>{{ task.tag }} · {{ task.due }}</span>
            </div>
            <em :class="{ 'is-urgent': ['紧急', '高'].includes(task.level) }">{{ task.level }}</em>
          </div>
        </div>
        <template #footer>
          <div class="card-footer-line">
            <span>今日已完成 6 项</span>
            <el-button text size="small" @click="router.push('/reviews/tasks')">
              审核任务
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>
      </DataCard>
    </div>

    <div class="dashboard-bottom">
      <DataCard title="重点企业动态" subtitle="按营业收入与风险变化综合排序">
        <template #actions>
          <el-button text size="small" @click="router.push('/monitoring/enterprises')">
            查看全部企业
          </el-button>
        </template>
        <el-table :data="keyEnterprises.slice(0, 5)" class="enterprise-table">
          <el-table-column label="企业" min-width="190">
            <template #default="{ row }">
              <div class="enterprise-cell">
                <span class="enterprise-logo">{{ row.name.slice(0, 1) }}</span>
                <div>
                  <strong>{{ row.name }}</strong>
                  <small>{{ row.tag }} · {{ row.sector }}</small>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="region" label="区域" width="90" />
          <el-table-column label="营收" width="100" align="right">
            <template #default="{ row }">{{ row.revenue.toFixed(1) }} 亿元</template>
          </el-table-column>
          <el-table-column label="同比" width="82" align="right">
            <template #default="{ row }">
              <span class="text-up">+{{ row.growth.toFixed(1) }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="风险" width="90" align="center">
            <template #default="{ row }"><RiskTag :level="row.risk" compact /></template>
          </el-table-column>
          <el-table-column label="" width="68" align="right">
            <template #default>
              <el-button text size="small" @click="router.push('/monitoring/enterprises')">
                画像
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </DataCard>

      <DataCard title="最近分析" subtitle="团队共享的分析结果">
        <template #actions>
          <el-button text size="small" @click="router.push('/analysis/qa')">发起分析</el-button>
        </template>
        <div class="recent-list">
          <button
            v-for="item in recentAnalyses"
            :key="item.title"
            type="button"
            class="recent-item"
            @click="router.push('/analysis/qa')"
          >
            <span class="recent-item__icon">
              <el-icon><DataAnalysis /></el-icon>
            </span>
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.type }} · {{ item.owner }} · {{ item.time }}</span>
            </div>
            <span class="recent-item__trust">{{ item.trust }}</span>
          </button>
        </div>
        <template #footer>
          <div class="card-footer-line">
            <span>当前展示团队最近 24 小时动态</span>
            <StatusBadge status="SUCCESS" />
          </div>
        </template>
      </DataCard>
    </div>

    <div class="data-footnote">
      <span>数据口径：企业注册地；部分融资数据更新滞后 2 个工作日。</span>
      <span>风险标签：{{ riskLabel('R4') }}及以上需在 24 小时内确认</span>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  gap: 16px;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  color: #147a68;
  background: #e9f8f4;
  border: 1px solid #ccefe6;
  border-radius: 999px;
  font-size: 9px;
}

.live-badge i {
  width: 5px;
  height: 5px;
  background: #0ba58a;
  border-radius: 50%;
}

.welcome-banner {
  position: relative;
  display: grid;
  min-height: 172px;
  grid-template-columns: minmax(0, 1.45fr) 230px minmax(260px, 0.72fr);
  gap: 0;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 72% -20%, rgba(35, 193, 212, 0.24), transparent 38%),
    linear-gradient(112deg, #0b1f3a 0%, #10365b 60%, #124b69 100%);
  border-radius: 15px;
  box-shadow: 0 12px 30px rgba(8, 30, 56, 0.12);
}

.welcome-banner::after {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(161, 196, 227, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(161, 196, 227, 0.035) 1px, transparent 1px);
  background-size: 26px 26px;
  content: "";
  pointer-events: none;
  mask-image: linear-gradient(100deg, transparent 35%, #000 100%);
}

.welcome-banner__copy {
  position: relative;
  z-index: 1;
  padding: 26px 28px;
}

.welcome-banner__date {
  color: #7d9dbd;
  font-size: 10px;
  letter-spacing: 0.04em;
}

.welcome-banner__copy h2 {
  margin: 7px 0 9px;
  color: #f7fbff;
  font-size: 22px;
  font-weight: 620;
  letter-spacing: -0.02em;
}

.welcome-banner__copy p {
  max-width: 680px;
  margin: 0;
  color: #a3bbd2;
  font-size: 12px;
  line-height: 1.8;
}

.welcome-banner__status {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 14px;
  color: #6f94b5;
  font-size: 9px;
}

.welcome-banner__status span:first-child {
  color: #80bfb4;
}

.welcome-banner__index {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 22px 18px;
  border-right: 1px solid rgba(170, 201, 229, 0.12);
  border-left: 1px solid rgba(170, 201, 229, 0.12);
}

.welcome-banner__index > span {
  color: #8caac6;
  font-size: 9px;
}

.welcome-banner__index strong {
  margin: 3px 0 1px;
  color: #fff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 43px;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.welcome-banner__index em {
  color: #6fd6c3;
  font-size: 9px;
  font-style: normal;
}

.index-scale {
  position: relative;
  width: 86%;
  height: 4px;
  margin-top: 11px;
  background: linear-gradient(90deg, #2e7295, #3ca3a8 48%, #54c7b4);
  border-radius: 4px;
}

.index-scale__mark {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 10px;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 0 7px rgba(255, 255, 255, 0.8);
}

.index-scale__labels {
  display: flex;
  width: 86%;
  justify-content: space-between;
  margin-top: 5px;
  color: #6889a8;
  font-size: 7px;
}

.welcome-banner__quick {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
}

.welcome-banner__quick button {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.welcome-banner__quick button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.quick-icon {
  display: flex;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #7fe0df;
  background: rgba(41, 183, 195, 0.13);
  border-radius: 6px;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
}

.welcome-banner__quick button > span:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.welcome-banner__quick strong,
.welcome-banner__quick small {
  display: block;
}

.welcome-banner__quick strong {
  color: #dcebf9;
  font-size: 10px;
  font-weight: 500;
}

.welcome-banner__quick small {
  margin-top: 2px;
  color: #6c8daa;
  font-size: 8px;
}

.welcome-banner__quick .el-icon {
  color: #5d7e9d;
  font-size: 10px;
}

.metrics-grid {
  gap: 12px;
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.72fr) minmax(300px, 0.68fr);
  gap: 16px;
}

.chart-pad {
  padding: 8px 16px 0;
}

.chart-insight {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #6f7e92;
  font-size: 10px;
  line-height: 1.6;
}

.chart-insight__mark {
  flex-shrink: 0;
  padding: 2px 5px;
  color: #1769e0;
  background: #edf4ff;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 600;
}

.focus-list {
  display: flex;
  flex-direction: column;
}

.focus-item {
  display: block;
  padding: 12px 2px;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #eef2f6;
  cursor: pointer;
}

.focus-item:last-child {
  border-bottom: 0;
}

.focus-item:hover strong {
  color: var(--dip-blue);
}

.focus-item__line {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8c98a9;
  font-size: 9px;
}

.focus-item__line time {
  margin-left: auto;
}

.focus-item strong {
  display: block;
  margin: 7px 0 4px;
  color: #2e3d54;
  font-size: 11px;
  font-weight: 550;
  line-height: 1.5;
  transition: color 0.18s ease;
}

.focus-item p {
  margin: 0;
  color: #8b97a8;
  font-size: 9px;
}

.dashboard-secondary {
  gap: 14px;
}

.card-footer-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #8995a6;
  font-size: 9px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f3f7;
}

.task-item:last-child {
  border-bottom: 0;
}

.task-item__dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  margin-top: 5px;
  background: #9bb0c8;
  border-radius: 50%;
}

.task-item__dot.is-urgent {
  background: #df4f56;
  box-shadow: 0 0 0 3px rgba(223, 79, 86, 0.08);
}

.task-item div {
  min-width: 0;
  flex: 1;
}

.task-item strong,
.task-item span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-item strong {
  color: #35455c;
  font-size: 10.5px;
  font-weight: 520;
}

.task-item span {
  margin-top: 3px;
  color: #919cad;
  font-size: 8.5px;
}

.task-item em {
  padding: 2px 5px;
  color: #79879a;
  background: #f2f5f8;
  border-radius: 4px;
  font-size: 8px;
  font-style: normal;
}

.task-item em.is-urgent {
  color: #c24048;
  background: #fff0f1;
}

.dashboard-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(310px, 0.62fr);
  gap: 16px;
}

.enterprise-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.enterprise-logo {
  display: flex;
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #35699e;
  background: #eaf1f9;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
}

.enterprise-cell strong,
.enterprise-cell small {
  display: block;
}

.enterprise-cell strong {
  color: #34445c;
  font-size: 11px;
  font-weight: 550;
}

.enterprise-cell small {
  margin-top: 2px;
  color: #8d99aa;
  font-size: 8.5px;
}

.recent-list {
  display: flex;
  flex-direction: column;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  text-align: left;
  background: none;
  border: 0;
  border-bottom: 1px solid #eef2f6;
  cursor: pointer;
}

.recent-item:last-child {
  border-bottom: 0;
}

.recent-item__icon {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #507ca7;
  background: #eef4fb;
  border-radius: 8px;
}

.recent-item div {
  min-width: 0;
  flex: 1;
}

.recent-item strong,
.recent-item div span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-item strong {
  color: #33445a;
  font-size: 10.5px;
  font-weight: 550;
}

.recent-item div span {
  margin-top: 4px;
  color: #919cad;
  font-size: 8.5px;
}

.recent-item__trust {
  display: flex;
  width: 21px;
  height: 21px;
  align-items: center;
  justify-content: center;
  color: #2e74c8;
  background: #edf4fe;
  border-radius: 50%;
  font-size: 9px;
  font-weight: 650;
}

@media (max-width: 1250px) {
  .welcome-banner {
    grid-template-columns: minmax(0, 1fr) 210px;
  }

  .welcome-banner__quick {
    display: none;
  }
}

@media (max-width: 1050px) {
  .dashboard-main,
  .dashboard-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .welcome-banner {
    grid-template-columns: 1fr;
  }

  .welcome-banner__copy {
    padding: 22px 20px;
  }

  .welcome-banner__index {
    align-items: flex-start;
    padding: 16px 20px;
    border-top: 1px solid rgba(170, 201, 229, 0.12);
    border-right: 0;
    border-left: 0;
  }

  .welcome-banner__index strong {
    font-size: 34px;
  }

  .index-scale,
  .index-scale__labels {
    width: 100%;
  }
}
</style>
