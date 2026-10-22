<script setup lang="ts">
import { Download, MagicStick, Refresh, Share, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import ChainTopology from '@/components/ChainTopology.vue'
import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import {
  chainEdges,
  chainNodes,
  dataVersion,
  evidence,
  riskRecords,
  updatedAt,
} from '@/mock/data'
import type { ChainNode } from '@/types'
import { riskColor } from '@/utils/risk'

const router = useRouter()
const selectedNode = ref<ChainNode>(chainNodes[3])
const showRisk = ref(true)
const highlightPath = ref(true)
const showEnterprises = ref(true)
const evidenceVisible = ref(false)

const highRiskNodes = computed(() => chainNodes.filter((node) => ['R4', 'R5'].includes(node.risk)))

const selectedRisk = computed(
  () =>
    riskRecords.find((item) => item.chainNode.includes(selectedNode.value.label)) ||
    riskRecords[0],
)

function selectNode(node: ChainNode) {
  selectedNode.value = node
}

function simulateFailure() {
  ElMessage.warning(
    `已创建“${selectedNode.value.label}节点失效”模拟任务，预计影响 3 个下游节点与 42 家企业`,
  )
}

function exportGraph() {
  ElMessage.success('图谱快照已生成，正在准备下载')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="产业链风险图谱"
      description="叠加节点风险、关系权重和企业依赖，识别关键节点、风险传导路径与受影响对象。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Refresh">刷新图谱</el-button>
        <el-button :icon="Download" @click="exportGraph">导出图谱</el-button>
        <el-button type="primary" :icon="MagicStick" @click="router.push('/analysis/risk')">
          风险研判
        </el-button>
      </template>
    </PageHeader>

    <FilterBar label="图谱条件">
      <el-select model-value="人工智能" style="width: 145px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
      </el-select>
      <el-select model-value="全市" style="width: 115px">
        <el-option label="全市" value="全市" />
        <el-option label="海淀区" value="海淀区" />
      </el-select>
      <el-select model-value="全部风险类型" style="width: 150px">
        <el-option label="全部风险类型" value="全部风险类型" />
        <el-option label="供应链风险" value="供应链风险" />
        <el-option label="技术依赖风险" value="技术依赖风险" />
      </el-select>
      <el-select model-value="图层深度 3" style="width: 125px">
        <el-option label="图层深度 3" value="图层深度 3" />
        <el-option label="图层深度 2" value="图层深度 2" />
      </el-select>
      <template #extra>
        <div class="graph-switches">
          <el-switch v-model="showRisk" size="small" active-text="风险图层" />
          <el-switch v-model="showEnterprises" size="small" active-text="企业标签" />
          <el-switch v-model="highlightPath" size="small" active-text="高亮路径" />
        </div>
      </template>
    </FilterBar>

    <div class="chain-layout">
      <DataCard
        title="人工智能产业链风险拓扑"
        subtitle="点击节点查看风险、企业与证据；红色虚线表示高风险传导关系"
        :padded="false"
      >
        <template #actions>
          <div class="graph-legend">
            <span><i style="background: #0ba58a" />低</span>
            <span><i style="background: #5a8fd8" />一般</span>
            <span><i style="background: #e5a11a" />较高</span>
            <span><i style="background: #e57431" />高</span>
            <span><i style="background: #df4f56" />重大</span>
          </div>
        </template>
        <div class="graph-canvas">
          <ChainTopology
            :nodes="chainNodes"
            :edges="chainEdges"
            :selected-id="selectedNode.id"
            :show-risk="showRisk"
            :highlight-path="highlightPath"
            @select="selectNode"
          />
        </div>
        <template #footer>
          <div class="graph-footer">
            <span>12 个节点 · 12 条关系 · 2 条高风险路径</span>
            <span>图谱版本 GPH-AI-20261018-03</span>
          </div>
        </template>
      </DataCard>

      <div class="chain-side">
        <DataCard :title="selectedNode.label" subtitle="节点风险详情">
          <div class="node-risk-head">
            <div
              class="node-risk-score"
              :style="{ '--node-color': riskColor(selectedNode.risk) }"
            >
              <strong>{{ selectedNode.score }}</strong>
              <span>节点风险</span>
            </div>
            <div>
              <RiskTag :level="selectedNode.risk" />
              <p>{{ selectedNode.stage }}关键节点，关联 {{ selectedNode.enterprises }} 家企业。</p>
            </div>
          </div>
          <div class="node-metrics">
            <div><span>上游依赖</span><strong>3</strong><small>个节点</small></div>
            <div><span>下游影响</span><strong>5</strong><small>个节点</small></div>
            <div><span>证据数量</span><strong>8</strong><small>条</small></div>
          </div>
          <div class="node-reason">
            <span>主要风险原因</span>
            <p>{{ selectedRisk.summary }}</p>
          </div>
          <div class="node-actions">
            <el-button size="small" @click="evidenceVisible = true">查看证据</el-button>
            <el-button size="small" @click="router.push(`/monitoring/risks/${selectedRisk.id}`)">
              风险详情
            </el-button>
            <el-button size="small" type="warning" plain @click="simulateFailure">模拟失效</el-button>
          </div>
        </DataCard>

        <DataCard title="高风险路径" subtitle="按路径风险值排序">
          <div class="path-list">
            <button type="button" @click="router.push('/analysis/risk')">
              <div class="path-line">
                <RiskTag level="R5" compact />
                <span>EDA → 芯片设计 → 智算中心</span>
              </div>
              <p>路径风险 91 · 影响 42 家企业</p>
            </button>
            <button type="button" @click="router.push('/analysis/risk')">
              <div class="path-line">
                <RiskTag level="R4" compact />
                <span>AI 芯片 → 智算中心 → 大模型</span>
              </div>
              <p>路径风险 82 · 影响 31 家企业</p>
            </button>
            <button type="button" @click="router.push('/analysis/risk')">
              <div class="path-line">
                <RiskTag level="R3" compact />
                <span>封装测试 → 智算设备 → 自动驾驶</span>
              </div>
              <p>路径风险 66 · 影响 17 家企业</p>
            </button>
          </div>
        </DataCard>

        <DataCard title="风险节点" subtitle="高风险与重大风险节点">
          <div class="high-risk-list">
            <button
              v-for="node in highRiskNodes"
              :key="node.id"
              type="button"
              @click="selectNode(node)"
            >
              <span :style="{ background: riskColor(node.risk) }" />
              <div><strong>{{ node.label }}</strong><small>{{ node.score }} 分 · {{ node.enterprises }} 家企业</small></div>
              <RiskTag :level="node.risk" compact />
            </button>
          </div>
        </DataCard>
      </div>
    </div>

    <div class="chain-insight">
      <div class="chain-insight__icon"><el-icon><Share /></el-icon></div>
      <div>
        <strong>图谱洞察</strong>
        <p>
          EDA 工具与 AI 芯片是当前风险传导的关键上游节点。风险沿“芯片设计—智算中心—大模型”路径
          向下游扩散，建议优先核验核心供应商依赖度，并评估国产替代验证周期。
        </p>
      </div>
      <el-button type="primary" plain @click="router.push('/analysis/risk')">生成传导研判</el-button>
    </div>

    <div class="chain-warning">
      <el-icon><Warning /></el-icon>
      图谱关系来源于知识图谱与企业供应关系核验，部分边关系标记为“待核验”，不应用于对外正式结论。
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="evidence" title="产业链节点证据" />
  </div>
</template>

<style scoped>
.graph-switches {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
}

.graph-switches :deep(.el-switch__label) {
  color: #6f7e92;
  font-size: 9px;
}

.chain-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(315px, 0.55fr);
  align-items: start;
  gap: 16px;
}

.graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.graph-legend span {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #7f8c9e;
  font-size: 8px;
}

.graph-legend i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.graph-canvas {
  min-height: 530px;
  padding: 2px 11px 0;
}

.graph-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #8c98a9;
  font-size: 8px;
}

.chain-side {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.node-risk-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.node-risk-score {
  display: flex;
  width: 82px;
  height: 82px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background:
    radial-gradient(circle at center, #fff 55%, transparent 56%),
    conic-gradient(var(--node-color) 0 80%, #edf2f7 80%);
  border-radius: 50%;
}

.node-risk-score strong {
  color: var(--node-color);
  font-family: Georgia, serif;
  font-size: 24px;
  font-weight: 500;
}

.node-risk-score span {
  color: #8c98a8;
  font-size: 7px;
}

.node-risk-head p {
  margin: 6px 0 0;
  color: #7c899b;
  font-size: 8.5px;
  line-height: 1.55;
}

.node-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: 13px 0;
  overflow: hidden;
  background: #e8eef5;
  border: 1px solid #e8eef5;
  border-radius: 7px;
}

.node-metrics > div {
  padding: 8px;
  background: #fafbfd;
}

.node-metrics span,
.node-metrics strong,
.node-metrics small {
  display: block;
}

.node-metrics span {
  color: #8d99a9;
  font-size: 7px;
}

.node-metrics strong {
  margin-top: 2px;
  color: #344a62;
  font-size: 16px;
  font-weight: 620;
}

.node-metrics small {
  color: #9ba5b2;
  font-size: 7px;
}

.node-reason {
  padding: 10px;
  background: #f8fafc;
  border-radius: 7px;
}

.node-reason span {
  color: #7c899b;
  font-size: 8px;
  font-weight: 550;
}

.node-reason p {
  margin: 4px 0 0;
  color: #718095;
  font-size: 8.5px;
  line-height: 1.65;
}

.node-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 11px;
}

.path-list {
  display: flex;
  flex-direction: column;
}

.path-list button {
  padding: 9px 0;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.path-list button:last-child {
  border-bottom: 0;
}

.path-line {
  display: flex;
  align-items: center;
  gap: 7px;
}

.path-line span {
  color: #43556c;
  font-size: 8.5px;
}

.path-list p {
  margin: 4px 0 0 42px;
  color: #939ead;
  font-size: 7.5px;
}

.high-risk-list {
  display: flex;
  flex-direction: column;
}

.high-risk-list button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.high-risk-list button:last-child {
  border-bottom: 0;
}

.high-risk-list button > span {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
}

.high-risk-list button div {
  min-width: 0;
  flex: 1;
}

.high-risk-list strong,
.high-risk-list small {
  display: block;
}

.high-risk-list strong {
  color: #3f5168;
  font-size: 9px;
  font-weight: 550;
}

.high-risk-list small {
  margin-top: 2px;
  color: #99a3b1;
  font-size: 7px;
}

.chain-insight {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 17px;
  background: linear-gradient(90deg, #f4f9ff, #fbfdff);
  border: 1px solid #dfe9f6;
  border-radius: 10px;
}

.chain-insight__icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  background: #e9f2ff;
  border-radius: 8px;
}

.chain-insight > div:nth-child(2) {
  flex: 1;
}

.chain-insight strong {
  color: #344d69;
  font-size: 9.5px;
  font-weight: 600;
}

.chain-insight p {
  margin: 3px 0 0;
  color: #718298;
  font-size: 8.5px;
  line-height: 1.6;
}

.chain-warning {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #94733f;
  font-size: 8px;
}

@media (max-width: 1120px) {
  .chain-layout {
    grid-template-columns: 1fr;
  }

  .chain-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .chain-side {
    grid-template-columns: 1fr;
  }

  .chain-insight {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
