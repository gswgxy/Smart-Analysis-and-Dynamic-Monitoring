<script setup lang="ts">
import { ArrowLeft, Download, OfficeBuilding, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import { dataVersion, keyEnterprises, updatedAt } from '@/mock/data'
import { axisLabelStyle, axisLineStyle, chartTooltip, splitLineStyle } from '@/utils/charts'

const route = useRoute()
const router = useRouter()
const evidenceVisible = ref(false)

const parkMap: Record<string, { name: string; district: string; focus: string; enterprises: number; output: number; occupancy: string }> = {
  'park-zgc-software': {
    name: '中关村软件园',
    district: '海淀区',
    focus: '人工智能、软件服务',
    enterprises: 486,
    output: 628.4,
    occupancy: '96%',
  },
  'park-ai-origin': {
    name: '中关村人工智能产业园',
    district: '海淀区',
    focus: '大模型、AI 芯片',
    enterprises: 312,
    output: 386.2,
    occupancy: '92%',
  },
  'park-eda': {
    name: '北京经开区信创园',
    district: '经开区',
    focus: '集成电路、信创',
    enterprises: 268,
    output: 412.7,
    occupancy: '89%',
  },
}

const park = computed(
  () => parkMap[String(route.params.id)] || parkMap['park-zgc-software'],
)

const structureOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'item' },
  legend: {
    orient: 'vertical',
    right: 4,
    top: 'center',
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    textStyle: { color: '#778499', fontSize: 8 },
  },
  series: [
    {
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['38%', '50%'],
      itemStyle: { borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      data: [
        { value: 38, name: '人工智能', itemStyle: { color: '#1769e0' } },
        { value: 22, name: '软件服务', itemStyle: { color: '#15b8c7' } },
        { value: 16, name: '集成电路', itemStyle: { color: '#7d6be8' } },
        { value: 13, name: '数字内容', itemStyle: { color: '#e5a11a' } },
        { value: 11, name: '其他', itemStyle: { color: '#a7b6c8' } },
      ],
    },
  ],
}))

const outputOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  grid: { top: 20, left: 38, right: 15, bottom: 24 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'],
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    min: 30,
    max: 64,
    axisLabel: { ...axisLabelStyle, formatter: '{value} 亿' },
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      data: [39.6, 41.2, 37.8, 40.4, 44.8, 47.2, 49.5, 52.6],
      lineStyle: { color: '#1769e0', width: 2.2 },
      itemStyle: { color: '#1769e0' },
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
    },
  ],
}))

function exportPark() {
  ElMessage.success('园区画像导出任务已创建')
}
</script>

<template>
  <div class="page-shell">
    <div class="back-line">
      <el-button text :icon="ArrowLeft" @click="router.push('/monitoring/regions')">
        返回区域与园区
      </el-button>
      <span>园区编号 {{ route.params.id }}</span>
    </div>

    <PageHeader
      :title="park.name"
      :description="`${park.district} · ${park.focus} · 载体利用率 ${park.occupancy}`"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Star">关注园区</el-button>
        <el-button :icon="Download" @click="exportPark">导出画像</el-button>
        <el-button type="primary" :icon="OfficeBuilding">查看招商机会</el-button>
      </template>
    </PageHeader>

    <section class="park-hero">
      <div class="park-mark">ZGC</div>
      <div class="park-copy">
        <span>园区概览</span>
        <h2>{{ park.name }}</h2>
        <p>
          以人工智能、AI 芯片和软件服务为核心，园区已形成从基础软件、算法模型到行业应用的产业集群，
          重点企业带动效应明显。
        </p>
        <div class="park-tags">
          <span>人工智能特色园</span>
          <span>市级示范园区</span>
          <span>产业链完整度 82%</span>
          <span>高价值专利密集</span>
        </div>
      </div>
      <div class="park-stats">
        <div><span>入驻企业</span><strong>{{ park.enterprises }}</strong><small>家</small></div>
        <div><span>产业产值</span><strong>{{ park.output }}</strong><small>亿元</small></div>
        <div><span>载体利用率</span><strong>{{ park.occupancy }}</strong><small>较高</small></div>
      </div>
    </section>

    <div class="park-kpis">
      <div><span>规上企业</span><strong>126<small>家</small></strong><em>同比 +8</em></div>
      <div><span>从业人数</span><strong>48,620<small>人</small></strong><em>同比 +5.7%</em></div>
      <div><span>专利总量</span><strong>12,486<small>件</small></strong><em>同比 +21.3%</em></div>
      <div><span>研发投入强度</span><strong>19.4<small>%</small></strong><em>全市均值 14.2%</em></div>
      <div><span>风险企业</span><strong>2<small>家</small></strong><em class="text-down">1 条高风险</em></div>
    </div>

    <div class="park-charts">
      <DataCard title="产业结构" subtitle="按企业数量占比">
        <BaseChart :option="structureOption" height="290px" />
      </DataCard>
      <DataCard title="产业产值趋势" subtitle="近 8 个月园区产值（亿元）">
        <BaseChart :option="outputOption" height="290px" />
      </DataCard>
    </div>

    <div class="park-bottom">
      <DataCard title="重点企业" subtitle="园区内重点企业及风险状态">
        <el-table :data="keyEnterprises.slice(0, 4)">
          <el-table-column prop="name" label="企业" min-width="180" />
          <el-table-column prop="sector" label="细分领域" width="120" />
          <el-table-column label="营收" width="100" align="right">
            <template #default="{ row }">{{ row.revenue.toFixed(1) }} 亿元</template>
          </el-table-column>
          <el-table-column label="风险" width="85" align="center">
            <template #default="{ row }"><RiskTag :level="row.risk" compact /></template>
          </el-table-column>
        </el-table>
      </DataCard>
      <DataCard title="产业链缺口" subtitle="基于园区企业和产业链图谱识别">
        <div class="gap-list">
          <div><span>封装测试</span><strong>本地配套不足</strong><small>依赖区外企业 68%</small></div>
          <div><span>关键设备</span><strong>供应商集中</strong><small>头部依赖度 54%</small></div>
          <div><span>数据服务</span><strong>企业数量偏少</strong><small>缺口约 24 家</small></div>
          <div><span>人才服务</span><strong>高层次人才缺口</strong><small>缺口约 1,200 人</small></div>
        </div>
      </DataCard>
    </div>

    <div class="park-note">
      园区边界、载体利用率和企业归属来自园区基础数据库；招商机会基于产业链缺口与区域资源匹配生成，
      正式使用前需经园区管理机构确认。
    </div>
  </div>
</template>

<style scoped>
.back-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8e9aaa;
  font-size: 8px;
}

.park-hero {
  display: flex;
  align-items: center;
  gap: 19px;
  padding: 21px;
  background:
    radial-gradient(circle at 82% 0%, rgba(21, 184, 199, 0.07), transparent 28%),
    linear-gradient(105deg, #f7fbff, #fff);
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.park-mark {
  display: flex;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #1769e0, #15a6b4);
  border-radius: 15px;
  box-shadow: 0 10px 24px rgba(23, 105, 224, 0.18);
  font-family: Georgia, serif;
  font-size: 17px;
  letter-spacing: 0.04em;
}

.park-copy {
  min-width: 0;
  flex: 1;
}

.park-copy > span {
  color: #8a97a8;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.park-copy h2 {
  margin: 4px 0 6px;
  color: #273c55;
  font-size: 19px;
  font-weight: 630;
}

.park-copy p {
  max-width: 600px;
  margin: 0;
  color: #758398;
  font-size: 9px;
  line-height: 1.7;
}

.park-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 9px;
}

.park-tags span {
  padding: 2px 6px;
  color: #56738f;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 7px;
}

.park-stats {
  display: flex;
  flex-shrink: 0;
  gap: 24px;
  padding-left: 20px;
  border-left: 1px solid #e5ecf4;
}

.park-stats span,
.park-stats strong,
.park-stats small {
  display: block;
}

.park-stats span {
  color: #8d99aa;
  font-size: 8px;
}

.park-stats strong {
  margin: 3px 0 1px;
  color: #2f455d;
  font-size: 22px;
  font-weight: 620;
}

.park-stats small {
  color: #96a1b0;
  font-size: 7px;
}

.park-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e7edf4;
  border: 1px solid #e7edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.park-kpis > div {
  padding: 12px 15px;
  background: #fff;
}

.park-kpis span,
.park-kpis strong,
.park-kpis em {
  display: block;
}

.park-kpis span {
  color: #8a96a7;
  font-size: 8px;
}

.park-kpis strong {
  margin: 3px 0 1px;
  color: #31475f;
  font-size: 20px;
  font-weight: 620;
}

.park-kpis small {
  margin-left: 2px;
  color: #8e9aaa;
  font-size: 8px;
}

.park-kpis em {
  color: #0b9477;
  font-size: 7.5px;
  font-style: normal;
}

.park-charts {
  display: grid;
  grid-template-columns: minmax(260px, 0.7fr) minmax(0, 1.3fr);
  gap: 16px;
}

.park-bottom {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;
}

.gap-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gap-list > div {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 2px 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
}

.gap-list span {
  grid-row: span 2;
  color: #546f8c;
  font-size: 8.5px;
}

.gap-list strong {
  color: #3f5269;
  font-size: 8.5px;
  font-weight: 550;
}

.gap-list small {
  color: #95a0af;
  font-size: 7.5px;
}

.park-note {
  color: #929dac;
  font-size: 8px;
  line-height: 1.6;
}

@media (max-width: 1000px) {
  .park-stats {
    display: none;
  }

  .park-charts,
  .park-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .park-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .park-kpis {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
