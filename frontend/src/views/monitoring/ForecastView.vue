<script setup lang="ts">
import { Cpu, DocumentAdd, Refresh, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { dataVersion, forecastFactors, forecastSeries, months, updatedAt } from '@/mock/data'
import {
  axisLabelStyle,
  axisLineStyle,
  chartTooltip,
  splitLineStyle,
} from '@/utils/charts'

const router = useRouter()
const scenario = ref('基准情景')
const horizon = ref('未来6个月')
const metric = ref('营业收入')
const confidence = ref('90%')
const running = ref(false)

const forecastMonths = ['2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04']
const allMonths = [...months, ...forecastMonths]

const forecastOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  legend: {
    top: 0,
    right: 0,
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    textStyle: { color: '#778499', fontSize: 9 },
  },
  grid: { top: 44, left: 46, right: 25, bottom: 28 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: allMonths.map((month) => month.slice(2)),
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: { ...axisLabelStyle, interval: 1 },
  },
  yAxis: {
    type: 'value',
    name: '亿元',
    nameTextStyle: { color: '#8995a7', fontSize: 9 },
    min: 260,
    axisLabel: axisLabelStyle,
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  series: [
    {
      name: '历史值',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      data: [...forecastSeries.history, ...Array(6).fill(null)],
      lineStyle: { color: '#1769e0', width: 2.4 },
      itemStyle: { color: '#1769e0', borderColor: '#fff', borderWidth: 1.5 },
    },
    {
      name: '预测值',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      data: [
        ...Array(11).fill(null),
        forecastSeries.history[11],
        ...forecastSeries.forecast,
      ],
      lineStyle: { color: '#15b8c7', width: 2.4, type: 'dashed' },
      itemStyle: { color: '#15b8c7', borderColor: '#fff', borderWidth: 1.5 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(21,184,199,0.15)' },
            { offset: 1, color: 'rgba(21,184,199,0.01)' },
          ],
        },
      },
    },
    {
      name: '90% 置信上界',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: [
        ...Array(11).fill(null),
        forecastSeries.history[11],
        ...forecastSeries.upper,
      ],
      lineStyle: { color: '#b9d7df', width: 1, type: 'dotted' },
    },
    {
      name: '90% 置信下界',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: [
        ...Array(11).fill(null),
        forecastSeries.history[11],
        ...forecastSeries.lower,
      ],
      lineStyle: { color: '#b9d7df', width: 1, type: 'dotted' },
    },
  ],
}))

const factorOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: 5, left: 92, right: 42, bottom: 12 },
  xAxis: {
    type: 'value',
    min: -20,
    max: 45,
    axisLabel: { ...axisLabelStyle, formatter: '{value}%' },
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: forecastFactors.map((item) => item.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#5f6e83', fontSize: 9 },
  },
  series: [
    {
      type: 'bar',
      barWidth: 9,
      data: forecastFactors.map((item) => ({
        value: item.contribution,
        itemStyle: {
          color: item.contribution >= 0 ? '#1769e0' : '#df4f56',
          borderRadius: 5,
        },
      })),
      showBackground: true,
      backgroundStyle: { color: '#f1f5f9', borderRadius: 5 },
      label: {
        show: true,
        position: 'right',
        color: '#7e8b9d',
        fontSize: 8,
        formatter: '{c}%',
      },
    },
  ],
}))

const scenarioCards = [
  {
    name: '基准情景',
    value: '517.0',
    delta: '+12.4%',
    note: '订单与研发投入维持当前趋势',
    tone: 'base',
  },
  {
    name: '乐观情景',
    value: '548.6',
    delta: '+19.2%',
    note: '重点企业订单加速、融资回暖',
    tone: 'optimistic',
  },
  {
    name: '风险情景',
    value: '472.3',
    delta: '+3.1%',
    note: '供应链中断、市场订单下降',
    tone: 'risk',
  },
]

function rerun() {
  running.value = true
  setTimeout(() => {
    running.value = false
    ElMessage.success('预测任务已完成，结果已写入最新数据版本')
  }, 800)
}

function saveResult() {
  ElMessage.success('预测结果已保存到分析结果库')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="趋势预测"
      description="基于历史指标、季节性和外生因素输出可解释的预测值、置信区间、模型误差与情景对比。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="DocumentAdd" @click="saveResult">保存结果</el-button>
        <el-button type="primary" :icon="Refresh" :loading="running" @click="rerun">
          重新计算
        </el-button>
      </template>
    </PageHeader>

    <FilterBar label="预测参数">
      <el-select v-model="metric" style="width: 145px">
        <el-option label="营业收入" value="营业收入" />
        <el-option label="企业总数" value="企业总数" />
        <el-option label="专利申请量" value="专利申请量" />
      </el-select>
      <el-select v-model="horizon" style="width: 135px">
        <el-option label="未来3个月" value="未来3个月" />
        <el-option label="未来6个月" value="未来6个月" />
        <el-option label="未来12个月" value="未来12个月" />
      </el-select>
      <el-select v-model="confidence" style="width: 115px">
        <el-option label="90% 置信" value="90%" />
        <el-option label="95% 置信" value="95%" />
        <el-option label="80% 置信" value="80%" />
      </el-select>
      <el-radio-group v-model="scenario" size="small">
        <el-radio-button value="基准情景">基准</el-radio-button>
        <el-radio-button value="乐观情景">乐观</el-radio-button>
        <el-radio-button value="风险情景">风险</el-radio-button>
      </el-radio-group>
      <template #extra>
        <span class="status-line"><span class="inline-dot" />模型 Prophet + XGBoost</span>
      </template>
    </FilterBar>

    <div class="forecast-summary">
      <div class="forecast-summary__main">
        <span>2027 年 4 月预测值</span>
        <strong>517.0<small>亿元</small></strong>
        <em><el-icon><TrendCharts /></el-icon> 同比增长 12.4%</em>
      </div>
      <div><span>预测区间</span><strong>469—565</strong><small>90% 置信水平</small></div>
      <div><span>回测误差 MAPE</span><strong>4.8%</strong><small>优于目标阈值 6%</small></div>
      <div><span>模型版本</span><strong>FST-2.4</strong><small>2026-10-18 发布</small></div>
      <div class="forecast-summary__note">
        <el-icon><Cpu /></el-icon>
        <span>大模型仅用于解释预测结果，预测数值由时序模型计算。</span>
      </div>
    </div>

    <div class="forecast-main">
      <DataCard title="历史与预测曲线" subtitle="实线为历史值，虚线为预测值，点线为置信区间边界">
        <template #actions>
          <span class="tag-soft">情景：{{ scenario }}</span>
        </template>
        <BaseChart :option="forecastOption" height="366px" :loading="running" />
      </DataCard>
      <DataCard title="影响因素" subtitle="对预测结果的主要正向与负向贡献">
        <BaseChart :option="factorOption" height="280px" />
        <template #footer>
          <div class="factor-note">
            模型认为重点企业订单与研发投入是未来 6 个月的主要支撑因素，供应链不确定性形成负向拖累。
          </div>
        </template>
      </DataCard>
    </div>

    <div class="scenario-grid">
      <article
        v-for="item in scenarioCards"
        :key="item.name"
        class="scenario-card"
        :class="[`is-${item.tone}`, { 'is-active': scenario === item.name }]"
        @click="scenario = item.name"
      >
        <div class="scenario-card__head">
          <span>{{ item.name }}</span>
          <i v-if="scenario === item.name">当前</i>
        </div>
        <strong>{{ item.value }}<small>亿元</small></strong>
        <em>{{ item.delta }} · 2027年4月</em>
        <p>{{ item.note }}</p>
      </article>
    </div>

    <div class="forecast-bottom">
      <DataCard title="模型与数据说明" subtitle="结果可追溯、可复核">
        <div class="model-info-grid">
          <div>
            <span>训练数据</span>
            <strong>2023-01 至 2026-10</strong>
            <small>46 个有效月度观测</small>
          </div>
          <div>
            <span>验证方式</span>
            <strong>滚动回测 6 折</strong>
            <small>MAE 11.6 / RMSE 15.8</small>
          </div>
          <div>
            <span>外生变量</span>
            <strong>订单、融资、政策</strong>
            <small>共 8 个特征</small>
          </div>
          <div>
            <span>数据版本</span>
            <strong>{{ dataVersion }}</strong>
            <small>无缺失值警告</small>
          </div>
        </div>
        <el-alert
          title="预测结果用于趋势研判，不替代业务决策。数据不足、模型失败或置信区间过宽时，应转专家复核。"
          type="info"
          :closable="false"
          show-icon
        />
      </DataCard>
      <DataCard title="下一步" subtitle="将结果带入分析或报告">
        <div class="next-actions">
          <button type="button" @click="router.push('/analysis/topic')">
            <span>01</span>
            <div><strong>生成专题研判</strong><small>将预测结论写入专题报告</small></div>
          </button>
          <button type="button" @click="router.push('/reports/generate')">
            <span>02</span>
            <div><strong>创建报告初稿</strong><small>自动同步图表、证据和模型版本</small></div>
          </button>
          <button type="button" @click="router.push('/reviews/tasks')">
            <span>03</span>
            <div><strong>转专家复核</strong><small>低置信度结果需人工确认</small></div>
          </button>
        </div>
      </DataCard>
    </div>
  </div>
</template>

<style scoped>
.forecast-summary {
  display: grid;
  grid-template-columns: minmax(210px, 1.2fr) repeat(3, minmax(125px, 0.62fr)) minmax(230px, 1fr);
  gap: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.forecast-summary > div {
  padding: 16px 18px;
  border-right: 1px solid #edf1f5;
}

.forecast-summary > div:last-child {
  border-right: 0;
}

.forecast-summary span,
.forecast-summary strong,
.forecast-summary small {
  display: block;
}

.forecast-summary span {
  color: #8290a3;
  font-size: 8.5px;
}

.forecast-summary strong {
  margin: 4px 0 2px;
  color: #263b54;
  font-size: 20px;
  font-weight: 620;
}

.forecast-summary small {
  color: #929dad;
  font-size: 8px;
}

.forecast-summary__main {
  background: linear-gradient(90deg, #f4f9ff, #fff);
}

.forecast-summary__main strong {
  color: #1769e0;
  font-family: Georgia, serif;
  font-size: 31px;
  font-weight: 500;
}

.forecast-summary__main strong small {
  display: inline;
  margin-left: 4px;
  color: #6b86a5;
  font-family: inherit;
  font-size: 9px;
}

.forecast-summary__main em {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #0a9678;
  font-size: 8.5px;
  font-style: normal;
}

.forecast-summary__note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6f8198;
  background: #f9fbfd;
  font-size: 9px;
  line-height: 1.6;
}

.forecast-summary__note .el-icon {
  flex-shrink: 0;
  color: #5485b9;
  font-size: 18px;
}

.forecast-summary__note span {
  color: #6f8198;
  font-size: 9px;
}

.forecast-main {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(310px, 0.65fr);
  gap: 16px;
}

.factor-note {
  color: #7d899c;
  font-size: 9px;
  line-height: 1.65;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.scenario-card {
  position: relative;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.scenario-card:hover,
.scenario-card.is-active {
  border-color: #9ec3ee;
  transform: translateY(-2px);
}

.scenario-card::before {
  position: absolute;
  top: 0;
  left: 16px;
  width: 32px;
  height: 3px;
  background: #1769e0;
  border-radius: 0 0 3px 3px;
  content: "";
}

.scenario-card.is-optimistic::before {
  background: #0ba58a;
}

.scenario-card.is-risk::before {
  background: #df4f56;
}

.scenario-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #65758b;
  font-size: 10px;
}

.scenario-card__head i {
  padding: 2px 5px;
  color: #1769e0;
  background: #edf4ff;
  border-radius: 4px;
  font-size: 7px;
  font-style: normal;
}

.scenario-card strong {
  display: block;
  margin: 10px 0 2px;
  color: #283d56;
  font-size: 26px;
  font-weight: 620;
  letter-spacing: -0.03em;
}

.scenario-card strong small {
  margin-left: 3px;
  color: #8491a3;
  font-size: 9px;
}

.scenario-card em {
  color: #0c9477;
  font-size: 9px;
  font-style: normal;
}

.scenario-card p {
  margin: 10px 0 0;
  color: #8d99a9;
  font-size: 9px;
}

.forecast-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(290px, 0.7fr);
  gap: 16px;
}

.model-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin-bottom: 13px;
  overflow: hidden;
  background: #e8eef5;
  border: 1px solid #e8eef5;
  border-radius: 8px;
}

.model-info-grid > div {
  padding: 11px;
  background: #f9fbfd;
}

.model-info-grid span,
.model-info-grid strong,
.model-info-grid small {
  display: block;
}

.model-info-grid span {
  color: #8794a6;
  font-size: 8px;
}

.model-info-grid strong {
  margin: 4px 0 2px;
  color: #3b4d64;
  font-size: 10px;
  font-weight: 580;
}

.model-info-grid small {
  color: #98a3b2;
  font-size: 7.5px;
}

.next-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.next-actions button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.next-actions button:hover {
  background: #f5f8fc;
}

.next-actions button > span {
  color: #9db1c8;
  font-family: Georgia, serif;
  font-size: 16px;
}

.next-actions button div {
  flex: 1;
}

.next-actions strong,
.next-actions small {
  display: block;
}

.next-actions strong {
  color: #3c4e66;
  font-size: 10px;
  font-weight: 550;
}

.next-actions small {
  margin-top: 2px;
  color: #96a1b0;
  font-size: 8px;
}

@media (max-width: 1200px) {
  .forecast-summary {
    grid-template-columns: 1.2fr repeat(3, 1fr);
  }

  .forecast-summary__note {
    display: none;
  }

  .forecast-main,
  .forecast-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .forecast-summary {
    grid-template-columns: 1fr 1fr;
  }

  .forecast-summary > div:nth-child(2) {
    border-right: 0;
  }

  .scenario-grid {
    grid-template-columns: 1fr;
  }

  .model-info-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
