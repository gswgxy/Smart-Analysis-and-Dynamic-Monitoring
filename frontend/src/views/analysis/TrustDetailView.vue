<script setup lang="ts">
import { ArrowLeft, DocumentChecked, RefreshLeft, Warning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, evidence, updatedAt } from '@/mock/data'
import { chartTooltip } from '@/utils/charts'

const route = useRoute()
const router = useRouter()

const dimensions = [
  { name: '数据完整性', score: 96, weight: 25, note: '核心指标无缺失，融资数据滞后 2 个工作日' },
  { name: '证据一致性', score: 92, weight: 25, note: '3 条证据相互支持，1 条图谱关系待核验' },
  { name: '来源可靠性', score: 95, weight: 20, note: '政策与指标来源为官方数据源' },
  { name: '模型置信度', score: 88, weight: 20, note: '模型回测 MAPE 4.8%，处于目标范围' },
  { name: '时效性', score: 90, weight: 10, note: '数据期次为 2026 年 10 月' },
]

const deductions = [
  { item: '融资数据更新滞后', value: -4, reason: '融资事件库最近同步时间为 2 个工作日前' },
  { item: '图谱关系待核验', value: -3, reason: 'AI 芯片供应关系尚未完成企业侧确认' },
  { item: '样本覆盖不足', value: -2, reason: '部分初创企业未纳入月报口径' },
  { item: '模型不确定性', value: -3, reason: '风险情景下预测区间较宽' },
]

const totalScore = computed(() =>
  dimensions.reduce((sum, item) => sum + item.score * (item.weight / 100), 0),
)

const gaugeOption = computed<EChartsOption>(() => ({
  tooltip: chartTooltip,
  series: [
    {
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      center: ['50%', '57%'],
      radius: '88%',
      min: 0,
      max: 100,
      splitNumber: 5,
      progress: {
        show: true,
        width: 12,
        itemStyle: { color: '#1769e0' },
      },
      axisLine: { lineStyle: { width: 12, color: [[1, '#edf2f7']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { distance: 18, color: '#8b97a8', fontSize: 8 },
      pointer: { show: false },
      anchor: { show: false },
      title: {
        offsetCenter: [0, '36%'],
        color: '#7d899b',
        fontSize: 9,
      },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '-2%'],
        color: '#1f344d',
        fontSize: 32,
        fontWeight: 600,
        formatter: '{value}',
      },
      data: [{ value: Number(totalScore.value.toFixed(1)), name: '综合可信度评分' }],
    },
  ],
}))

async function requestReview() {
  try {
    const { value } = await ElMessageBox.prompt(
      '请说明需要复核的可信度问题或证据疑点',
      '申请人工复核',
      {
        confirmButtonText: '提交复核',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '例如：图谱关系未经企业确认，申请专家复核。',
      },
    )
    if (value) {
      ElMessage.success('复核申请已提交，任务编号 REV-TRUST-20261018-01')
      router.push('/reviews/tasks')
    }
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="back-line">
      <el-button text :icon="ArrowLeft" @click="router.push('/analysis/qa')">
        返回分析结果
      </el-button>
      <span>可信度编号 {{ route.params.id }}</span>
    </div>

    <PageHeader
      title="分析可信度详情"
      description="展示综合可信度、维度得分、扣分原因、结论声明和专家复核状态。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #badge>
        <TrustBadge level="B" />
        <StatusBadge status="SUBMITTED" />
      </template>
      <template #actions>
        <el-button :icon="RefreshLeft">重新计算</el-button>
        <el-button type="primary" :icon="Warning" @click="requestReview">申请复核</el-button>
      </template>
    </PageHeader>

    <div class="trust-layout">
      <DataCard title="综合可信度" subtitle="权重模型 TRUST-V2.1">
        <BaseChart :option="gaugeOption" height="270px" />
        <div class="trust-grade">
          <span>可信度等级</span>
          <strong>B</strong>
          <p>可使用，需注意限制</p>
        </div>
        <div class="trust-summary">
          该结论可进入专题与报告初稿，正式发布前需说明融资数据滞后和图谱关系待核验的情况。
        </div>
      </DataCard>

      <DataCard title="维度得分" subtitle="各维度按权重计入综合评分">
        <div class="dimension-scores">
          <div v-for="item in dimensions" :key="item.name">
            <div class="dimension-score__head">
              <span>{{ item.name }}</span>
              <em>权重 {{ item.weight }}%</em>
              <strong>{{ item.score }}</strong>
            </div>
            <div class="dimension-score__bar">
              <i :style="{ width: `${item.score}%` }" />
            </div>
            <p>{{ item.note }}</p>
          </div>
        </div>
      </DataCard>
    </div>

    <div class="trust-bottom">
      <DataCard title="扣分原因" subtitle="每项扣分可回溯到数据或证据">
        <el-table :data="deductions">
          <el-table-column prop="item" label="扣分项" width="160" />
          <el-table-column prop="reason" label="原因说明" min-width="260" />
          <el-table-column label="分值" width="90" align="right">
            <template #default="{ row }"><span class="text-down">{{ row.value }}</span></template>
          </el-table-column>
          <el-table-column label="证据" width="80" align="right">
            <template #default><el-button text size="small">查看</el-button></template>
          </el-table-column>
        </el-table>
      </DataCard>

      <DataCard title="审核状态" subtitle="专家审核结果会回写可信度">
        <div class="review-state">
          <div class="review-state__icon"><el-icon><DocumentChecked /></el-icon></div>
          <div>
            <strong>已提交专家复核</strong>
            <p>复核任务 REV-TRUST-20261018-01</p>
            <span>提交时间 2026-10-18 10:12</span>
          </div>
        </div>
        <div class="review-timeline">
          <div><span class="is-done" /><p>系统自动评分完成<small>2026-10-18 09:56</small></p></div>
          <div><span class="is-done" /><p>提交专家复核<small>2026-10-18 10:12</small></p></div>
          <div><span /><p>专家审核中<small>预计 24 小时内完成</small></p></div>
        </div>
      </DataCard>
    </div>

    <DataCard title="结论声明" subtitle="随分析结果和报告自动附带">
      <div class="claim-statement">
        <p>
          本结论基于 2026 年 10 月产业指标、产业链知识图谱及公开政策文件生成。数据完整性为 96%，
          融资事件数据存在 2 个工作日滞后。AI 芯片供应关系尚未完成企业侧确认，相关影响范围可能存在偏差。
          建议在正式发布前由产业专家复核供应链依赖关系与影响企业清单。
        </p>
        <div>
          <span>算法版本：mock-v0.2</span>
          <span>可信度模型：TRUST-V2.1</span>
          <span>证据数量：{{ evidence.length }}</span>
          <span>数据版本：{{ dataVersion }}</span>
        </div>
      </div>
    </DataCard>
  </div>
</template>

<style scoped>
.back-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #909cac;
  font-size: 8px;
}

.trust-layout {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 16px;
}

.trust-grade {
  padding: 10px 12px;
  text-align: center;
  background: #f5f9fe;
  border-radius: 7px;
}

.trust-grade span,
.trust-grade strong,
.trust-grade p {
  display: block;
}

.trust-grade span {
  color: #8592a4;
  font-size: 7.5px;
}

.trust-grade strong {
  margin: 2px 0;
  color: #1769e0;
  font-family: Georgia, serif;
  font-size: 20px;
  font-weight: 500;
}

.trust-grade p {
  margin: 0;
  color: #667b93;
  font-size: 8px;
}

.trust-summary {
  padding: 10px 12px;
  margin-top: 9px;
  color: #748398;
  background: #fafbfd;
  border-left: 3px solid #9dbfe5;
  border-radius: 0 6px 6px 0;
  font-size: 8px;
  line-height: 1.65;
}

.dimension-scores {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.dimension-score__head {
  display: grid;
  grid-template-columns: 1fr 70px 35px;
  align-items: center;
  gap: 8px;
}

.dimension-score__head span {
  color: #4f6178;
  font-size: 8.5px;
  font-weight: 550;
}

.dimension-score__head em {
  color: #96a1b0;
  font-size: 7px;
  font-style: normal;
  text-align: right;
}

.dimension-score__head strong {
  color: #34526f;
  font-size: 9px;
  font-weight: 600;
  text-align: right;
}

.dimension-score__bar {
  height: 5px;
  margin: 5px 0 3px;
  overflow: hidden;
  background: #edf2f7;
  border-radius: 5px;
}

.dimension-score__bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #58a4e2, #1769e0);
  border-radius: 5px;
}

.dimension-scores p {
  margin: 0;
  color: #929dad;
  font-size: 7px;
}

.trust-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
  gap: 16px;
}

.review-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f9fe;
  border-radius: 7px;
}

.review-state__icon {
  display: flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  background: #e6f0fd;
  border-radius: 7px;
}

.review-state strong,
.review-state p,
.review-state span {
  display: block;
}

.review-state strong {
  color: #3d526a;
  font-size: 8.5px;
  font-weight: 570;
}

.review-state p,
.review-state span {
  margin-top: 2px;
  color: #8e9aaa;
  font-size: 7px;
}

.review-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.review-timeline > div {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.review-timeline > div > span {
  width: 6px;
  height: 6px;
  margin-top: 3px;
  background: #c3cfdd;
  border-radius: 50%;
}

.review-timeline > div > span.is-done {
  background: #0ba58a;
}

.review-timeline p {
  margin: 0;
  color: #5f7085;
  font-size: 8px;
}

.review-timeline small {
  display: block;
  margin-top: 2px;
  color: #99a4b2;
  font-size: 6.5px;
}

.claim-statement {
  padding: 13px 15px;
  background: #f9fbfd;
  border: 1px solid #e8eef5;
  border-radius: 7px;
}

.claim-statement p {
  margin: 0;
  color: #5f7085;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 9px;
  line-height: 1.9;
}

.claim-statement > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 9px;
  margin-top: 9px;
  color: #99a4b2;
  border-top: 1px solid #e8eef5;
  font-size: 6.5px;
}

@media (max-width: 1000px) {
  .trust-layout,
  .trust-bottom {
    grid-template-columns: 1fr;
  }
}
</style>
