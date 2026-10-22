<script setup lang="ts">
import {
  Aim,
  ArrowRight,
  Download,
  MagicStick,
  Refresh,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import { dataVersion, evidence, keyEnterprises, riskAnalysisPath, updatedAt } from '@/mock/data'
import { riskColor } from '@/utils/risk'

const router = useRouter()
const objectType = ref('企业')
const riskObject = ref('京智算力科技有限公司')
const riskType = ref('供应链风险')
const depth = ref('3 层传导')
const scenario = ref('基准情景')
const evidenceVisible = ref(false)
const running = ref(false)

const affectedEnterprises = computed(() => keyEnterprises.slice(0, 4))

const policies = [
  { title: '北京市促进人工智能产业创新发展行动计划', type: '产业政策', relevance: 96 },
  { title: '关键核心技术攻关与国产替代支持办法', type: '技术政策', relevance: 91 },
  { title: '重点产业链供应链安全保障工作方案', type: '供应链政策', relevance: 88 },
]

const scenarios = [
  { name: '基准情景', impact: '42 家企业', delay: '90 天', score: 86 },
  { name: '短期断供', impact: '67 家企业', delay: '150 天', score: 93 },
  { name: '替代加速', impact: '24 家企业', delay: '45 天', score: 68 },
]

function recalculate() {
  running.value = true
  setTimeout(() => {
    running.value = false
    ElMessage.success('风险传导路径已重新计算')
  }, 800)
}

function exportAnalysis() {
  ElMessage.success('风险研判结果已保存，可加入专题或报告')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="风险研判"
      description="围绕企业、产业、区域或产业链节点，识别风险源、计算传导路径、关联影响企业和政策依据。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Download" @click="exportAnalysis">保存研判</el-button>
        <el-button type="primary" :icon="MagicStick" :loading="running" @click="recalculate">
          计算传导路径
        </el-button>
      </template>
    </PageHeader>

    <FilterBar label="研判对象">
      <el-select v-model="objectType" style="width: 105px">
        <el-option label="企业" value="企业" />
        <el-option label="产业链节点" value="产业链节点" />
        <el-option label="产业" value="产业" />
        <el-option label="区域" value="区域" />
      </el-select>
      <el-select
        v-model="riskObject"
        filterable
        allow-create
        default-first-option
        style="width: 230px"
      >
        <el-option
          v-for="item in keyEnterprises"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-select v-model="riskType" style="width: 140px">
        <el-option label="供应链风险" value="供应链风险" />
        <el-option label="技术依赖风险" value="技术依赖风险" />
        <el-option label="经营风险" value="经营风险" />
        <el-option label="合规风险" value="合规风险" />
      </el-select>
      <el-select v-model="depth" style="width: 120px">
        <el-option label="3 层传导" value="3 层传导" />
        <el-option label="4 层传导" value="4 层传导" />
        <el-option label="2 层传导" value="2 层传导" />
      </el-select>
      <template #extra>
        <span class="status-line"><span class="inline-dot" />风险模型 V2.6</span>
      </template>
    </FilterBar>

    <div class="risk-analysis-head">
      <section class="risk-object-card">
        <div class="risk-object-icon"><el-icon><Aim /></el-icon></div>
        <div>
          <span>研判对象</span>
          <h2>{{ riskObject }}</h2>
          <p>AI 芯片设计 · 海淀区 · 重点链主企业</p>
        </div>
        <div class="risk-object-score">
          <span>综合风险</span>
          <strong>{{ scenarios[0].score }}</strong>
          <RiskTag level="R4" />
        </div>
      </section>
      <section class="risk-analysis-summary">
        <span>研判结论</span>
        <p>
          核心 EDA 模块外部授权存在中断可能，风险将沿芯片设计、智算中心和基础大模型路径向下游传导。
          预计 42 家企业在 90 天内受到影响，需优先推动国产工具验证与备选供应商切换。
        </p>
      </section>
    </div>

    <DataCard title="风险传导路径" subtitle="路径风险 = 源风险强度 × 关系权重 × 目标脆弱度 × 路径衰减 × 时间衰减">
      <div class="risk-path">
        <template v-for="(item, index) in riskAnalysisPath" :key="item.title">
          <article class="path-node" :style="{ '--risk-color': riskColor(item.level) }">
            <div class="path-node__head">
              <span>{{ item.title }}</span>
              <RiskTag :level="item.level" compact />
            </div>
            <h3>{{ item.name }}</h3>
            <p>{{ item.detail }}</p>
            <div class="path-node__score">
              <span>路径风险</span>
              <i><b :style="{ width: `${90 - index * 8}%` }" /></i>
              <strong>{{ 91 - index * 7 }}</strong>
            </div>
          </article>
          <div v-if="index < riskAnalysisPath.length - 1" class="path-arrow">
            <span>× 0.{{ 8 - index }}</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </template>
      </div>
      <template #footer>
        <div class="path-footer">
          <span>累计影响强度 74.8 · 路径置信度 86%</span>
          <div>
            <span><i class="inline-dot" />路径处于监测中</span>
            <el-button text size="small" @click="evidenceVisible = true">查看路径证据</el-button>
          </div>
        </div>
      </template>
    </DataCard>

    <div class="risk-analysis-grid">
      <DataCard title="受影响企业" subtitle="按业务影响程度排序">
        <template #actions>
          <el-button text size="small">查看全部 42 家</el-button>
        </template>
        <el-table :data="affectedEnterprises">
          <el-table-column prop="name" label="企业" min-width="185" />
          <el-table-column prop="sector" label="细分领域" width="115" />
          <el-table-column label="影响强度" width="120" align="right">
            <template #default="{ row, $index }">
              <span :class="$index < 2 ? 'text-down' : 'text-muted'">
                {{ 82 - $index * 11 }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="风险" width="82" align="center">
            <template #default="{ row }"><RiskTag :level="row.risk" compact /></template>
          </el-table-column>
        </el-table>
      </DataCard>

      <DataCard title="关联政策" subtitle="用于合规判断与处置建议">
        <div class="policy-list">
          <div v-for="item in policies" :key="item.title">
            <span>{{ item.type }}</span>
            <div><strong>{{ item.title }}</strong><small>政策匹配度 {{ item.relevance }}%</small></div>
          </div>
        </div>
      </DataCard>
    </div>

    <div class="scenario-section">
      <div class="scenario-title">
        <div>
          <h2 class="section-title">情景模拟</h2>
          <p class="section-subtitle">调整风险假设，比较受影响范围与恢复时间</p>
        </div>
        <el-radio-group v-model="scenario" size="small">
          <el-radio-button v-for="item in scenarios" :key="item.name" :value="item.name">
            {{ item.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="scenario-grid">
        <article
          v-for="item in scenarios"
          :key="item.name"
          :class="{ 'is-active': scenario === item.name }"
          @click="scenario = item.name"
        >
          <span>{{ item.name }}</span>
          <strong>{{ item.score }}<small>风险评分</small></strong>
          <div><span>受影响企业</span><b>{{ item.impact }}</b></div>
          <div><span>预计恢复</span><b>{{ item.delay }}</b></div>
        </article>
      </div>
    </div>

    <div class="risk-recommendation">
      <div class="recommendation-icon"><el-icon><Warning /></el-icon></div>
      <div>
        <span>处置建议</span>
        <h3>优先推进国产 EDA 模块验证，建立双供应商保障机制</h3>
        <p>
          建议在一周内完成 34 家芯片设计企业的工具依赖核验，筛选 2 家具备验证能力的国产供应商，
          并将智算中心扩容计划纳入风险监测。对受影响的高风险企业建立一对一跟踪机制。
        </p>
      </div>
      <div class="recommendation-actions">
        <el-button type="primary" @click="router.push('/reports/generate')">生成报告</el-button>
        <el-button @click="evidenceVisible = true">查看证据</el-button>
      </div>
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="evidence" title="风险研判证据" />
  </div>
</template>

<style scoped>
.risk-analysis-head {
  display: grid;
  grid-template-columns: minmax(310px, 0.7fr) minmax(0, 1.3fr);
  gap: 16px;
}

.risk-object-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px 18px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.risk-object-icon {
  display: flex;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  background: #edf4ff;
  border-radius: 9px;
  font-size: 18px;
}

.risk-object-card > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.risk-object-card span {
  color: #8a96a7;
  font-size: 7.5px;
}

.risk-object-card h2 {
  margin: 3px 0;
  color: #2d425b;
  font-size: 13px;
  font-weight: 600;
}

.risk-object-card p {
  margin: 0;
  color: #8e9aaa;
  font-size: 7.5px;
}

.risk-object-score {
  padding-left: 14px;
  border-left: 1px solid #e9eef5;
  text-align: center;
}

.risk-object-score span,
.risk-object-score strong {
  display: block;
}

.risk-object-score strong {
  margin: 2px 0 4px;
  color: #d06133;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: 500;
}

.risk-analysis-summary {
  padding: 15px 17px;
  background: linear-gradient(90deg, #f7fbff, #fff);
  border: 1px solid #dfe9f6;
  border-radius: var(--dip-radius);
}

.risk-analysis-summary span {
  color: #1769e0;
  font-size: 7.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.risk-analysis-summary p {
  margin: 6px 0 0;
  color: #5d6f85;
  font-size: 9px;
  line-height: 1.8;
}

.risk-path {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 0;
  overflow-x: auto;
}

.path-node {
  position: relative;
  width: 190px;
  min-width: 190px;
  padding: 11px;
  background: #fbfcfe;
  border: 1px solid #e6edf5;
  border-top: 3px solid var(--risk-color);
  border-radius: 8px;
}

.path-node__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
}

.path-node__head > span {
  color: #8a96a7;
  font-size: 7px;
}

.path-node h3 {
  margin: 8px 0 4px;
  color: #354a63;
  font-size: 9.5px;
  font-weight: 570;
  line-height: 1.45;
}

.path-node p {
  min-height: 33px;
  margin: 0;
  color: #8390a2;
  font-size: 7.5px;
  line-height: 1.55;
}

.path-node__score {
  display: grid;
  grid-template-columns: 40px 1fr 20px;
  align-items: center;
  gap: 5px;
  padding-top: 7px;
  margin-top: 8px;
  border-top: 1px solid #edf1f6;
}

.path-node__score span {
  color: #98a3b2;
  font-size: 6.5px;
}

.path-node__score i {
  height: 4px;
  overflow: hidden;
  background: #edf2f7;
  border-radius: 4px;
}

.path-node__score b {
  display: block;
  height: 100%;
  background: var(--risk-color);
  border-radius: 4px;
}

.path-node__score strong {
  color: #5d6f84;
  font-size: 7px;
  text-align: right;
}

.path-arrow {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2px;
  color: #9fb3c8;
}

.path-arrow span {
  font-size: 6.5px;
  white-space: nowrap;
}

.path-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #8a96a7;
  font-size: 7.5px;
}

.path-footer > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.risk-analysis-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 16px;
}

.policy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.policy-list > div {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px;
  background: #f9fbfd;
  border-radius: 6px;
}

.policy-list > div > span {
  padding: 2px 5px;
  color: #5e7894;
  background: #edf3f9;
  border-radius: 3px;
  font-size: 6.5px;
  white-space: nowrap;
}

.policy-list div div {
  min-width: 0;
}

.policy-list strong,
.policy-list small {
  display: block;
}

.policy-list strong {
  color: #41546b;
  font-size: 8px;
  font-weight: 520;
  line-height: 1.45;
}

.policy-list small {
  margin-top: 3px;
  color: #99a4b2;
  font-size: 6.5px;
}

.scenario-section {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.scenario-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.scenario-grid article {
  padding: 12px;
  background: #fafcfe;
  border: 1px solid #e5edf5;
  border-radius: 8px;
  cursor: pointer;
}

.scenario-grid article:hover,
.scenario-grid article.is-active {
  border-color: #98bee6;
  background: #f5faff;
}

.scenario-grid article > span {
  color: #64758a;
  font-size: 8px;
}

.scenario-grid article > strong {
  display: block;
  margin: 5px 0 8px;
  color: #33495f;
  font-size: 22px;
  font-weight: 620;
}

.scenario-grid small {
  margin-left: 3px;
  color: #96a1b0;
  font-size: 6.5px;
  font-weight: 400;
}

.scenario-grid article > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  color: #8c98a9;
  font-size: 7px;
}

.scenario-grid b {
  color: #4d637a;
  font-size: 7.5px;
  font-weight: 550;
}

.risk-recommendation {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 17px;
  background: linear-gradient(90deg, #fffaf0, #fffdf8);
  border: 1px solid #f0e4ca;
  border-radius: 10px;
}

.recommendation-icon {
  display: flex;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #c98d21;
  background: #fff2d8;
  border-radius: 8px;
}

.risk-recommendation > div:nth-child(2) {
  flex: 1;
}

.risk-recommendation span {
  color: #a47b2f;
  font-size: 7.5px;
  font-weight: 600;
}

.risk-recommendation h3 {
  margin: 4px 0;
  color: #654f2f;
  font-size: 10px;
  font-weight: 600;
}

.risk-recommendation p {
  max-width: 900px;
  margin: 0;
  color: #887550;
  font-size: 8px;
  line-height: 1.65;
}

.recommendation-actions {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
}

@media (max-width: 1000px) {
  .risk-analysis-head,
  .risk-analysis-grid {
    grid-template-columns: 1fr;
  }

  .risk-recommendation {
    flex-wrap: wrap;
  }

  .recommendation-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 650px) {
  .scenario-grid {
    grid-template-columns: 1fr;
  }
}
</style>
