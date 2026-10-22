<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Download,
  MagicStick,
  Search,
} from '@element-plus/icons-vue'
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
  keyEnterprises,
  riskRecords,
  updatedAt,
} from '@/mock/data'
import type { ChainNode } from '@/types'

const router = useRouter()
const selectedNode = ref<ChainNode>(chainNodes[3])
const direction = ref('上下游全景')
const activeTab = ref('enterprises')
const evidenceVisible = ref(false)

const stages = ['上游', '中游', '下游'] as const

const stageNodes = computed(() =>
  stages.map((stage) => ({
    stage,
    nodes: chainNodes.filter((node) => node.stage === stage),
  })),
)

const technologies = [
  { name: '高能效 AI 加速架构', maturity: '成熟', enterprises: 48, patents: 326, trend: '+18%' },
  { name: 'Chiplet 异构集成', maturity: '成长', enterprises: 26, patents: 148, trend: '+36%' },
  { name: '国产 EDA 工具链', maturity: '验证期', enterprises: 34, patents: 208, trend: '+24%' },
  { name: '多模态基础大模型', maturity: '成熟', enterprises: 21, patents: 412, trend: '+29%' },
  { name: '端侧模型压缩', maturity: '成长', enterprises: 38, patents: 96, trend: '+42%' },
]

const policies = [
  { title: '北京市促进人工智能产业创新发展行动计划', type: '产业政策', date: '2026-10-12', relevance: 96 },
  { title: '北京市算力基础设施建设实施方案', type: '基础设施', date: '2026-08-20', relevance: 92 },
  { title: '集成电路关键核心技术攻关支持办法', type: '技术攻关', date: '2026-06-15', relevance: 87 },
]

function exportAnalysis() {
  ElMessage.success('产业链分析结果已保存，可在报告中心继续使用')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="产业链分析"
      description="从上游供给、中游制造到下游应用分析产业链结构、关键节点、技术依赖、企业上链和薄弱环节。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Download" @click="exportAnalysis">保存分析</el-button>
        <el-button type="primary" :icon="MagicStick" @click="router.push('/analysis/topic')">
          生成专题
        </el-button>
      </template>
    </PageHeader>

    <FilterBar label="分析范围">
      <el-select model-value="人工智能" style="width: 145px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
      </el-select>
      <el-select model-value="人工智能全产业链" style="width: 190px">
        <el-option label="人工智能全产业链" value="人工智能全产业链" />
        <el-option label="AI 芯片产业链" value="AI 芯片产业链" />
        <el-option label="智能驾驶产业链" value="智能驾驶产业链" />
      </el-select>
      <el-select model-value="全市" style="width: 115px">
        <el-option label="全市" value="全市" />
        <el-option label="海淀区" value="海淀区" />
      </el-select>
      <el-date-picker model-value="2026-10" type="month" style="width: 140px" />
      <el-radio-group v-model="direction" size="small">
        <el-radio-button value="上下游全景">上下游全景</el-radio-button>
        <el-radio-button value="仅上游">仅上游</el-radio-button>
        <el-radio-button value="仅下游">仅下游</el-radio-button>
      </el-radio-group>
      <template #extra>
        <span class="status-line"><span class="inline-dot" />图谱版本 GPH-AI-20261018-03</span>
      </template>
    </FilterBar>

    <div class="chain-analysis-grid">
      <aside class="level-nav">
        <div class="level-nav__head">
          <strong>产业链层级</strong>
          <el-icon><Search /></el-icon>
        </div>
        <el-input placeholder="搜索节点" size="small" :prefix-icon="Search" />
        <div v-for="group in stageNodes" :key="group.stage" class="stage-group">
          <div class="stage-group__title">
            <span>{{ group.stage }}</span>
            <em>{{ group.nodes.length }}</em>
          </div>
          <button
            v-for="node in group.nodes"
            :key="node.id"
            type="button"
            :class="{ 'is-active': selectedNode.id === node.id }"
            @click="selectedNode = node"
          >
            <span>{{ node.label }}</span>
            <RiskTag :level="node.risk" compact />
          </button>
        </div>
      </aside>

      <DataCard
        title="产业链结构关系"
        subtitle="点击节点查看详情，虚线表示高风险传导关系"
        :padded="false"
      >
        <template #actions>
          <el-button text size="small">
            <el-icon><ArrowLeft /></el-icon>
            上游
          </el-button>
          <el-button text size="small">
            下游
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </template>
        <div class="analysis-graph">
          <ChainTopology
            :nodes="chainNodes"
            :edges="chainEdges"
            :selected-id="selectedNode.id"
            :show-risk="true"
            :highlight-path="true"
            @select="selectedNode = $event"
          />
        </div>
        <template #footer>
          <div class="graph-stat-line">
            <span>12 节点</span>
            <span>12 关系</span>
            <span>2 条风险路径</span>
            <span>2 个待核验关系</span>
          </div>
        </template>
      </DataCard>

      <aside class="node-detail">
        <DataCard :title="selectedNode.label" subtitle="节点详情">
          <div class="node-detail__head">
            <div>
              <RiskTag :level="selectedNode.risk" />
              <strong>{{ selectedNode.score }}<small>风险评分</small></strong>
            </div>
            <span class="node-stage">{{ selectedNode.stage }}</span>
          </div>
          <p class="node-desc">
            {{ selectedNode.label }}位于{{ selectedNode.stage }}关键环节，关联
            {{ selectedNode.enterprises }} 家企业。当前主要风险来自供应集中度与技术依赖。
          </p>
          <div class="node-metrics">
            <div><span>企业</span><strong>{{ selectedNode.enterprises }}</strong></div>
            <div><span>关键企业</span><strong>7</strong></div>
            <div><span>专利</span><strong>1,286</strong></div>
          </div>
          <div class="node-tags">
            <span>高集中度</span>
            <span>技术密集</span>
            <span>重点节点</span>
          </div>
          <el-button size="small" plain class="node-evidence" @click="evidenceVisible = true">
            查看节点证据
          </el-button>
        </DataCard>
        <DataCard title="薄弱环节" subtitle="按风险与依赖度识别">
          <div class="weak-list">
            <div><span>01</span><p>国产 EDA 核心模块对外部授权依赖较高。</p></div>
            <div><span>02</span><p>AI 芯片头部供应商采购占比达到 68%。</p></div>
            <div><span>03</span><p>先进封装产能利用率低于行业均值。</p></div>
          </div>
        </DataCard>
      </aside>
    </div>

    <DataCard :padded="false">
      <template #header>
        <div>
          <h2 class="section-title">节点关联信息</h2>
          <p class="section-subtitle">{{ selectedNode.label }} · 企业、技术、政策、风险与证据</p>
        </div>
      </template>
      <div class="relation-tabs">
        <el-tabs v-model="activeTab" class="node-tabs">
          <el-tab-pane label="企业" name="enterprises">
            <el-table :data="keyEnterprises.slice(0, 5)">
              <el-table-column prop="name" label="企业名称" min-width="210" />
              <el-table-column prop="sector" label="细分领域" width="130" />
              <el-table-column prop="region" label="区域" width="90" />
              <el-table-column label="营收" width="110" align="right">
                <template #default="{ row }">{{ row.revenue.toFixed(1) }} 亿元</template>
              </el-table-column>
              <el-table-column label="成长性" width="85" align="right">
                <template #default="{ row }"><span class="text-up">+{{ row.growth }}%</span></template>
              </el-table-column>
              <el-table-column label="风险" width="85" align="center">
                <template #default="{ row }"><RiskTag :level="row.risk" compact /></template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="技术" name="technology">
            <div class="technology-grid">
              <article v-for="item in technologies" :key="item.name">
                <div><span>{{ item.maturity }}</span><em class="text-up">{{ item.trend }}</em></div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.enterprises }} 家企业 · {{ item.patents }} 件专利</p>
              </article>
            </div>
          </el-tab-pane>
          <el-tab-pane label="政策" name="policy">
            <div class="policy-grid">
              <article v-for="item in policies" :key="item.title">
                <span>{{ item.type }}</span>
                <strong>{{ item.title }}</strong>
                <p>{{ item.date }} · 匹配度 {{ item.relevance }}%</p>
              </article>
            </div>
          </el-tab-pane>
          <el-tab-pane label="风险" name="risk">
            <el-table :data="riskRecords.slice(0, 4)">
              <el-table-column prop="title" label="风险事件" min-width="250" />
              <el-table-column prop="chainNode" label="节点" width="120" />
              <el-table-column label="等级" width="85" align="center">
                <template #default="{ row }"><RiskTag :level="row.level" compact /></template>
              </el-table-column>
              <el-table-column prop="detectedAt" label="发现时间" width="140" />
              <el-table-column label="操作" width="85" align="right">
                <template #default="{ row }">
                  <el-button text size="small" @click="router.push(`/monitoring/risks/${row.id}`)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="证据" name="evidence">
            <div class="evidence-grid">
              <button
                v-for="item in evidence"
                :key="item.id"
                type="button"
                @click="evidenceVisible = true"
              >
                <span>{{ item.sourceType }}</span>
                <strong>{{ item.title }}</strong>
                <p>{{ item.snippet }}</p>
                <small>{{ item.source }} · {{ item.publishedAt }}</small>
              </button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </DataCard>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="evidence" title="产业链节点证据" />
  </div>
</template>

<style scoped>
.chain-analysis-grid {
  display: grid;
  grid-template-columns: 195px minmax(0, 1fr) 250px;
  align-items: start;
  gap: 14px;
}

.level-nav {
  align-self: stretch;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.level-nav__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.level-nav__head strong {
  color: #354960;
  font-size: 10px;
  font-weight: 600;
}

.level-nav__head .el-icon {
  color: #93a0b1;
  font-size: 12px;
}

.stage-group {
  margin-top: 13px;
}

.stage-group__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 5px;
  color: #8693a5;
  font-size: 8px;
  font-weight: 600;
}

.stage-group__title em {
  color: #a0aab8;
  font-size: 7px;
  font-style: normal;
}

.stage-group button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  padding: 7px 7px;
  margin-bottom: 2px;
  color: #56677d;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 5px;
  font-size: 8.5px;
  cursor: pointer;
}

.stage-group button:hover,
.stage-group button.is-active {
  color: #1769e0;
  background: #f1f6fd;
}

.analysis-graph {
  padding: 0 5px;
}

.graph-stat-line {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #8c98a9;
  font-size: 8px;
}

.node-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.node-detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.node-detail__head > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.node-detail__head strong {
  color: #2e4761;
  font-size: 26px;
  font-weight: 620;
}

.node-detail__head small {
  margin-left: 4px;
  color: #8e9aaa;
  font-size: 7px;
  font-weight: 400;
}

.node-stage {
  padding: 3px 6px;
  color: #54708e;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 7px;
}

.node-desc {
  margin: 9px 0;
  color: #748398;
  font-size: 8.5px;
  line-height: 1.7;
}

.node-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e8eef5;
  border: 1px solid #e8eef5;
  border-radius: 6px;
}

.node-metrics > div {
  padding: 7px;
  background: #fafbfd;
}

.node-metrics span,
.node-metrics strong {
  display: block;
}

.node-metrics span {
  color: #8f9aaa;
  font-size: 6.5px;
}

.node-metrics strong {
  margin-top: 2px;
  color: #3d5067;
  font-size: 10px;
  font-weight: 580;
}

.node-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 9px 0;
}

.node-tags span {
  padding: 2px 5px;
  color: #5d7590;
  background: #f2f6fa;
  border-radius: 3px;
  font-size: 6.5px;
}

.node-evidence {
  width: 100%;
}

.weak-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weak-list > div {
  display: flex;
  align-items: flex-start;
  gap: 7px;
}

.weak-list span {
  color: #9db0c5;
  font-family: Georgia, serif;
  font-size: 11px;
}

.weak-list p {
  margin: 0;
  color: #6d7e93;
  font-size: 8px;
  line-height: 1.55;
}

.relation-tabs {
  padding: 0 17px 17px;
}

.node-tabs :deep(.el-tabs__item) {
  font-size: 9px;
}

.technology-grid,
.policy-grid,
.evidence-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  padding-top: 4px;
}

.technology-grid article,
.policy-grid article {
  padding: 11px;
  background: #f9fbfd;
  border: 1px solid #e8eef5;
  border-radius: 7px;
}

.technology-grid article > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.technology-grid span,
.policy-grid span {
  padding: 2px 5px;
  color: #5d7792;
  background: #edf3f9;
  border-radius: 3px;
  font-size: 6.5px;
}

.technology-grid em {
  font-size: 7px;
  font-style: normal;
}

.technology-grid strong,
.policy-grid strong {
  display: block;
  margin-top: 7px;
  color: #40536a;
  font-size: 8.5px;
  font-weight: 550;
  line-height: 1.5;
}

.technology-grid p,
.policy-grid p {
  margin: 4px 0 0;
  color: #929dad;
  font-size: 7px;
}

.evidence-grid button {
  padding: 10px;
  text-align: left;
  background: #f9fbfd;
  border: 1px solid #e8eef5;
  border-radius: 7px;
  cursor: pointer;
}

.evidence-grid span {
  padding: 2px 5px;
  color: #58748f;
  background: #edf3f8;
  border-radius: 3px;
  font-size: 6.5px;
}

.evidence-grid strong {
  display: block;
  margin-top: 6px;
  color: #40536a;
  font-size: 8px;
  font-weight: 550;
  line-height: 1.45;
}

.evidence-grid p {
  display: -webkit-box;
  overflow: hidden;
  margin: 4px 0;
  color: #758499;
  font-size: 7px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.evidence-grid small {
  color: #9aa5b3;
  font-size: 6.5px;
}

@media (max-width: 1150px) {
  .chain-analysis-grid {
    grid-template-columns: 170px minmax(0, 1fr);
  }

  .node-detail {
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .chain-analysis-grid {
    grid-template-columns: 1fr;
  }

  .node-detail {
    grid-column: auto;
    grid-template-columns: 1fr;
  }

  .technology-grid,
  .policy-grid,
  .evidence-grid {
    grid-template-columns: 1fr;
  }
}
</style>
