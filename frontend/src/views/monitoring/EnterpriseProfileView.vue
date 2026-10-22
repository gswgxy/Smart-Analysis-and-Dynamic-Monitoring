<script setup lang="ts">
import {
  Connection,
  DocumentAdd,
  OfficeBuilding,
  Search,
  Star,
  TrendCharts,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { dataVersion, evidence, keyEnterprises, riskRecords, updatedAt } from '@/mock/data'
import { axisLabelStyle, axisLineStyle, chartTooltip, splitLineStyle } from '@/utils/charts'

const router = useRouter()
const enterpriseName = ref(keyEnterprises[0].name)
const activeTab = ref('overview')
const evidenceVisible = ref(false)

const enterprise = computed(
  () => keyEnterprises.find((item) => item.name === enterpriseName.value) || keyEnterprises[0],
)

const enterpriseRisk = computed(
  () => riskRecords.find((item) => item.enterprise === enterprise.value.name) || riskRecords[0],
)

const radarOption = computed<EChartsOption>(() => ({
  tooltip: chartTooltip,
  radar: {
    center: ['50%', '51%'],
    radius: '64%',
    splitNumber: 4,
    indicator: [
      { name: '创新', max: 100 },
      { name: '成长', max: 100 },
      { name: '资本', max: 100 },
      { name: '产业链', max: 100 },
      { name: '风险韧性', max: 100 },
      { name: '政策适配', max: 100 },
    ],
    axisName: { color: '#657489', fontSize: 9 },
    splitLine: { lineStyle: { color: '#dfe8f2' } },
    splitArea: { areaStyle: { color: ['#fbfdff', '#f5f9fd'] } },
    axisLine: { lineStyle: { color: '#e6edf5' } },
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [88, 84, 76, 92, 61, 79],
          name: '企业得分',
          symbolSize: 4,
          lineStyle: { color: '#1769e0', width: 2 },
          itemStyle: { color: '#1769e0' },
          areaStyle: { color: 'rgba(23,105,224,0.16)' },
        },
      ],
    },
  ],
}))

const patentOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  grid: { top: 20, left: 35, right: 15, bottom: 25 },
  xAxis: {
    type: 'category',
    data: ['2021', '2022', '2023', '2024', '2025', '2026'],
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    axisLabel: axisLabelStyle,
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: [28, 36, 44, 52, 61, 72],
      barWidth: 18,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#1769e0' },
            { offset: 1, color: '#78aeee' },
          ],
        },
        borderRadius: [5, 5, 0, 0],
      },
    },
  ],
}))

const policyItems = [
  { title: '人工智能算力基础设施建设支持措施', type: '资金支持', date: '2026-08-12' },
  { title: '北京市专精特新企业培育计划', type: '资质认定', date: '2026-05-20' },
  { title: '重点领域研发费用加计扣除政策', type: '税收优惠', date: '2026-03-01' },
]

const relationEvents = [
  { time: '2026-09', title: '新增 2 家上游晶圆供应商', type: '供应链' },
  { time: '2026-07', title: '与京语智能签署算力合作协议', type: '合作' },
  { time: '2026-04', title: '完成 B+ 轮融资 12.8 亿元', type: '融资' },
  { time: '2025-12', title: '入选北京市人工智能链主企业', type: '资质' },
]

function exportProfile() {
  ElMessage.success('企业画像导出任务已创建')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="企业画像"
      description="汇集企业基础档案、产业链位置、创新能力、融资政策与风险事件，形成可追溯的企业全景视图。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="DocumentAdd" @click="exportProfile">导出画像</el-button>
        <el-button type="primary" :icon="TrendCharts" @click="router.push('/analysis/risk')">
          发起风险研判
        </el-button>
      </template>
    </PageHeader>

    <div class="enterprise-search">
      <el-select
        v-model="enterpriseName"
        filterable
        allow-create
        default-first-option
        placeholder="输入企业名称、统一社会信用代码或企业 ID"
        style="width: min(520px, 100%)"
      >
        <el-option
          v-for="item in keyEnterprises"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-button type="primary" :icon="Search">查询企业</el-button>
      <span>最近查看：京芯制造技术有限公司</span>
    </div>

    <section class="profile-hero">
      <div class="profile-logo">{{ enterprise.name.slice(0, 1) }}</div>
      <div class="profile-main">
        <div class="profile-title">
          <h2>{{ enterprise.name }}</h2>
          <span class="tag-soft">{{ enterprise.tag }}</span>
          <RiskTag :level="enterprise.risk" />
          <StatusBadge status="RESOLVED" />
        </div>
        <div class="profile-meta">
          <span><el-icon><OfficeBuilding /></el-icon> {{ enterprise.sector }} · {{ enterprise.region }}</span>
          <span>统一社会信用代码：91110108MA01****8X</span>
          <span>成立时间：2016-04-18</span>
        </div>
        <div class="profile-tags">
          <span>链主企业</span>
          <span>专精特新</span>
          <span>高新技术企业</span>
          <span>AI 芯片</span>
          <span>高专利密度</span>
        </div>
      </div>
      <div class="profile-score">
        <span>企业综合评分</span>
        <strong>86.4</strong>
        <em>超过 92% 同业企业</em>
      </div>
      <div class="profile-chain">
        <span>产业链位置</span>
        <div>
          <small>上游</small>
          <i />
          <strong>AI 芯片设计</strong>
          <i />
          <small>下游</small>
        </div>
        <em>中游 · 关键节点</em>
      </div>
    </section>

    <div class="profile-kpis">
      <div><span>营业收入</span><strong>{{ enterprise.revenue.toFixed(1) }}<small>亿元</small></strong><em class="text-up">同比 +{{ enterprise.growth }}%</em></div>
      <div><span>专利总量</span><strong>{{ enterprise.patents }}<small>件</small></strong><em class="text-up">近三年 +38.6%</em></div>
      <div><span>研发投入强度</span><strong>18.7<small>%</small></strong><em>行业均值 12.4%</em></div>
      <div><span>融资轮次</span><strong>B+<small>轮</small></strong><em>累计 26.4 亿元</em></div>
      <div><span>风险事件</span><strong>2<small>条</small></strong><em class="text-down">1 条待处置</em></div>
    </div>

    <el-tabs v-model="activeTab" class="profile-tabs">
      <el-tab-pane label="综合概览" name="overview">
        <div class="profile-grid">
          <DataCard title="企业能力雷达" subtitle="基于创新、成长、资本、产业链等维度">
            <BaseChart :option="radarOption" height="310px" />
          </DataCard>
          <DataCard title="关键经营信息" subtitle="最近数据期次 2026 年三季度">
            <div class="business-info-grid">
              <div><span>营业收入</span><strong>{{ enterprise.revenue.toFixed(1) }} 亿元</strong><em>同比 +{{ enterprise.growth }}%</em></div>
              <div><span>净利润</span><strong>8.62 亿元</strong><em>净利率 9.97%</em></div>
              <div><span>研发费用</span><strong>16.2 亿元</strong><em>强度 18.7%</em></div>
              <div><span>员工总数</span><strong>2,846 人</strong><em>研发占比 46%</em></div>
            </div>
            <div class="financial-note">
              <strong>经营判断</strong>
              <p>营收保持两位数增长，研发投入强度显著高于行业均值；应收账款周转天数上升，需关注下游回款节奏。</p>
            </div>
            <div class="enterprise-risk">
              <div>
                <RiskTag :level="enterpriseRisk.level" />
                <strong>{{ enterpriseRisk.title }}</strong>
              </div>
              <p>{{ enterpriseRisk.summary }}</p>
              <el-button text size="small" @click="router.push(`/monitoring/risks/${enterpriseRisk.id}`)">
                查看风险详情
              </el-button>
            </div>
          </DataCard>
        </div>
      </el-tab-pane>

      <el-tab-pane label="创新能力" name="innovation">
        <div class="profile-grid">
          <DataCard title="专利趋势" subtitle="近 6 年专利申请量">
            <BaseChart :option="patentOption" height="300px" />
          </DataCard>
          <DataCard title="创新标签" subtitle="基于专利、研发与人才数据自动生成">
            <div class="innovation-tags">
              <span>发明专利占比 72%</span>
              <span>AI 芯片架构</span>
              <span>高价值专利 86 件</span>
              <span>高层次人才 42 人</span>
              <span>创新平台 3 个</span>
              <span>研发人员占比 46%</span>
            </div>
            <div class="innovation-list">
              <div><span>01</span><p>核心技术聚焦高能效 AI 加速芯片与异构计算架构。</p></div>
              <div><span>02</span><p>近三年发明专利授权量年均增长 31.4%。</p></div>
              <div><span>03</span><p>与 3 所高校建立联合实验室，技术合作网络稳定。</p></div>
            </div>
          </DataCard>
        </div>
      </el-tab-pane>

      <el-tab-pane label="政策与融资" name="finance">
        <div class="profile-grid">
          <DataCard title="政策关联" subtitle="已匹配的产业政策与申报机会">
            <div class="policy-list">
              <div v-for="item in policyItems" :key="item.title">
                <span>{{ item.type }}</span>
                <div><strong>{{ item.title }}</strong><small>发布/匹配时间 {{ item.date }}</small></div>
                <el-button text size="small">查看</el-button>
              </div>
            </div>
          </DataCard>
          <DataCard title="融资历程" subtitle="已披露融资事件">
            <div class="financing-timeline">
              <div><span>2026-04</span><strong>B+ 轮</strong><p>12.8 亿元 · 产业基金领投</p></div>
              <div><span>2024-11</span><strong>B 轮</strong><p>8.6 亿元 · 多家机构联合投资</p></div>
              <div><span>2023-06</span><strong>A+ 轮</strong><p>3.2 亿元 · 战略投资人进入</p></div>
              <div><span>2021-09</span><strong>A 轮</strong><p>1.8 亿元 · 早期机构投资</p></div>
            </div>
          </DataCard>
        </div>
      </el-tab-pane>

      <el-tab-pane label="关系与事件" name="relations">
        <div class="profile-grid">
          <DataCard title="企业关系网络" subtitle="供应、合作、投资与技术关系">
            <div class="relation-network">
              <div class="relation-center">{{ enterprise.name.slice(0, 2) }}</div>
              <span class="relation-node n1">晶圆供应商</span>
              <span class="relation-node n2">封装测试</span>
              <span class="relation-node n3">大模型企业</span>
              <span class="relation-node n4">智算中心</span>
              <span class="relation-node n5">产业基金</span>
              <svg viewBox="0 0 500 270">
                <line x1="250" y1="135" x2="88" y2="65" />
                <line x1="250" y1="135" x2="414" y2="67" />
                <line x1="250" y1="135" x2="78" y2="211" />
                <line x1="250" y1="135" x2="418" y2="211" />
                <line x1="250" y1="135" x2="250" y2="252" />
              </svg>
            </div>
          </DataCard>
          <DataCard title="关键事件时间线" subtitle="近 12 个月">
            <div class="event-timeline">
              <div v-for="item in relationEvents" :key="item.title">
                <span>{{ item.time }}</span>
                <i />
                <div><strong>{{ item.title }}</strong><small>{{ item.type }}</small></div>
              </div>
            </div>
          </DataCard>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="profile-actions">
      <el-button :icon="Connection" @click="evidenceVisible = true">查看全部证据</el-button>
      <el-button :icon="Star">保存关注</el-button>
      <el-button>保存为分析结果</el-button>
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="evidence" title="企业画像证据" />
  </div>
</template>

<style scoped>
.enterprise-search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  padding: 13px 15px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.enterprise-search > span {
  margin-left: auto;
  color: #939ead;
  font-size: 8px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 19px 21px;
  background:
    radial-gradient(circle at 88% 0%, rgba(21, 184, 199, 0.07), transparent 28%),
    #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.profile-logo {
  display: flex;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #2f6ba2;
  background: linear-gradient(145deg, #e7f0fa, #d5e7f7);
  border: 1px solid #cadbef;
  border-radius: 14px;
  font-family: Georgia, serif;
  font-size: 23px;
}

.profile-main {
  min-width: 0;
  flex: 1;
}

.profile-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.profile-title h2 {
  margin: 0;
  color: #263b54;
  font-size: 19px;
  font-weight: 650;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 15px;
  margin-top: 7px;
  color: #8a96a7;
  font-size: 8.5px;
}

.profile-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 9px;
}

.profile-tags span {
  padding: 2px 6px;
  color: #52718f;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 7.5px;
}

.profile-score {
  padding: 0 20px;
  border-right: 1px solid #e8edf4;
  border-left: 1px solid #e8edf4;
  text-align: center;
}

.profile-score span,
.profile-score strong,
.profile-score em {
  display: block;
}

.profile-score span {
  color: #8592a3;
  font-size: 8px;
}

.profile-score strong {
  color: #1769e0;
  font-family: Georgia, serif;
  font-size: 30px;
  font-weight: 500;
}

.profile-score em {
  color: #94a0af;
  font-size: 7.5px;
  font-style: normal;
}

.profile-chain {
  width: 150px;
  flex-shrink: 0;
}

.profile-chain > span {
  color: #8491a3;
  font-size: 8px;
}

.profile-chain > div {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 7px 0 4px;
}

.profile-chain small {
  color: #8e9bab;
  font-size: 7px;
}

.profile-chain i {
  height: 1px;
  flex: 1;
  background: #cddbea;
}

.profile-chain strong {
  color: #315f8c;
  font-size: 8px;
  font-weight: 550;
  white-space: nowrap;
}

.profile-chain em {
  color: #99a3b1;
  font-size: 7px;
  font-style: normal;
}

.profile-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e7edf4;
  border: 1px solid #e7edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.profile-kpis > div {
  padding: 13px 16px;
  background: #fff;
}

.profile-kpis span,
.profile-kpis strong,
.profile-kpis em {
  display: block;
}

.profile-kpis span {
  color: #8693a5;
  font-size: 8px;
}

.profile-kpis strong {
  margin: 3px 0 2px;
  color: #2f435a;
  font-size: 21px;
  font-weight: 620;
}

.profile-kpis small {
  margin-left: 2px;
  color: #8a97a8;
  font-size: 8px;
}

.profile-kpis em {
  color: #929dac;
  font-size: 7.5px;
  font-style: normal;
}

.profile-grid {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 16px;
}

.business-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  overflow: hidden;
  background: #e8eef5;
  border: 1px solid #e8eef5;
  border-radius: 7px;
}

.business-info-grid > div {
  padding: 11px;
  background: #fafbfd;
}

.business-info-grid span,
.business-info-grid strong,
.business-info-grid em {
  display: block;
}

.business-info-grid span {
  color: #8794a6;
  font-size: 8px;
}

.business-info-grid strong {
  margin: 3px 0 2px;
  color: #344a62;
  font-size: 13px;
  font-weight: 600;
}

.business-info-grid em {
  color: #96a1b0;
  font-size: 7px;
  font-style: normal;
}

.financial-note {
  padding: 11px 12px;
  margin-top: 11px;
  background: #f7fafd;
  border-left: 3px solid #8db7e7;
  border-radius: 0 6px 6px 0;
}

.financial-note strong {
  color: #516982;
  font-size: 8.5px;
  font-weight: 580;
}

.financial-note p {
  margin: 4px 0 0;
  color: #7c899b;
  font-size: 8.5px;
  line-height: 1.65;
}

.enterprise-risk {
  padding: 11px 12px;
  margin-top: 10px;
  background: #fff8f8;
  border: 1px solid #f3dedf;
  border-radius: 7px;
}

.enterprise-risk > div:first-child {
  display: flex;
  align-items: center;
  gap: 7px;
}

.enterprise-risk strong {
  color: #6f4347;
  font-size: 9px;
  font-weight: 550;
}

.enterprise-risk p {
  margin: 6px 0 4px;
  color: #8c7779;
  font-size: 8px;
  line-height: 1.55;
}

.innovation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.innovation-tags span {
  padding: 5px 8px;
  color: #536d88;
  background: #f1f6fb;
  border: 1px solid #e4edf6;
  border-radius: 5px;
  font-size: 8px;
}

.innovation-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 14px;
}

.innovation-list > div {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.innovation-list span {
  color: #9cb2c9;
  font-family: Georgia, serif;
  font-size: 13px;
}

.innovation-list p {
  margin: 0;
  color: #718095;
  font-size: 8.5px;
  line-height: 1.6;
}

.policy-list,
.financing-timeline {
  display: flex;
  flex-direction: column;
}

.policy-list > div {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 9px 0;
  border-bottom: 1px solid #edf1f6;
}

.policy-list > div > span {
  padding: 2px 5px;
  color: #54718f;
  background: #f1f5f9;
  border-radius: 3px;
  font-size: 7px;
}

.policy-list div div {
  min-width: 0;
  flex: 1;
}

.policy-list strong,
.policy-list small {
  display: block;
}

.policy-list strong {
  color: #40536b;
  font-size: 9px;
  font-weight: 520;
  line-height: 1.5;
}

.policy-list small {
  margin-top: 2px;
  color: #99a4b2;
  font-size: 7px;
}

.financing-timeline > div {
  position: relative;
  padding: 8px 0 8px 15px;
  border-left: 1px solid #e2e9f1;
}

.financing-timeline > div::before {
  position: absolute;
  top: 13px;
  left: -3px;
  width: 5px;
  height: 5px;
  background: #1769e0;
  border-radius: 50%;
  content: "";
}

.financing-timeline span {
  color: #9aa5b3;
  font-size: 7.5px;
}

.financing-timeline strong {
  display: block;
  margin: 2px 0;
  color: #3f5269;
  font-size: 9px;
}

.financing-timeline p {
  margin: 0;
  color: #8b97a8;
  font-size: 8px;
}

.relation-network {
  position: relative;
  display: flex;
  height: 270px;
  align-items: center;
  justify-content: center;
}

.relation-network svg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.relation-network line {
  stroke: #cfe0f0;
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
}

.relation-center {
  position: relative;
  z-index: 2;
  display: flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #1769e0, #15a7b4);
  border-radius: 50%;
  box-shadow: 0 8px 22px rgba(23, 105, 224, 0.2);
  font-size: 11px;
}

.relation-node {
  position: absolute;
  z-index: 2;
  padding: 7px 10px;
  color: #48627e;
  background: #fff;
  border: 1px solid #cfe0ef;
  border-radius: 7px;
  box-shadow: 0 3px 10px rgba(30, 65, 101, 0.06);
  font-size: 8px;
}

.relation-node.n1 {
  top: 42px;
  left: 25px;
}

.relation-node.n2 {
  top: 44px;
  right: 25px;
}

.relation-node.n3 {
  bottom: 40px;
  left: 18px;
}

.relation-node.n4 {
  right: 18px;
  bottom: 40px;
}

.relation-node.n5 {
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
}

.event-timeline {
  display: flex;
  flex-direction: column;
}

.event-timeline > div {
  display: grid;
  grid-template-columns: 52px 9px 1fr;
  align-items: flex-start;
  gap: 7px;
  padding-bottom: 15px;
}

.event-timeline > div > span {
  color: #99a4b2;
  font-size: 7.5px;
}

.event-timeline i {
  width: 6px;
  height: 6px;
  margin-top: 2px;
  background: #7da9d9;
  border-radius: 50%;
}

.event-timeline strong,
.event-timeline small {
  display: block;
}

.event-timeline strong {
  color: #40536a;
  font-size: 8.5px;
  font-weight: 520;
}

.event-timeline small {
  margin-top: 2px;
  color: #98a3b2;
  font-size: 7px;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 14px;
}

.profile-tabs :deep(.el-tabs__item) {
  height: 36px;
  font-size: 10px;
}

@media (max-width: 1100px) {
  .profile-chain {
    display: none;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .profile-hero {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .profile-score {
    padding: 10px 0 0;
    border-top: 1px solid #e8edf4;
    border-right: 0;
    border-left: 0;
    text-align: left;
  }

  .profile-kpis {
    grid-template-columns: 1fr 1fr;
  }

  .profile-kpis > div:last-child {
    grid-column: span 2;
  }
}
</style>
