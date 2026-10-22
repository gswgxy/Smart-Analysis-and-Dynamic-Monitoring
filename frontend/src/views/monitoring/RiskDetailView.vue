<script setup lang="ts">
import { ArrowLeft, Bell, Promotion, Share, Warning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { dataVersion, evidence, riskRecords, updatedAt } from '@/mock/data'
import { riskColor } from '@/utils/risk'

const route = useRoute()
const router = useRouter()
const evidenceVisible = ref(false)

const risk = computed(
  () => riskRecords.find((item) => item.id === route.params.id) || riskRecords[0],
)

const timeline = [
  {
    time: '2026-10-18 02:40',
    title: '风险模型命中规则 RS-SUP-042',
    content: '核心供应商采购占比连续三个月高于阈值，自动生成 R4 风险事件。',
    tone: 'danger',
  },
  {
    time: '2026-10-18 08:15',
    title: '系统完成关联影响分析',
    content: '关联 42 家企业、3 个产业链节点，预计影响未来 90 天算力扩容计划。',
    tone: 'primary',
  },
  {
    time: '2026-10-18 09:30',
    title: '产业监测一组已认领',
    content: '任务进入处置中，负责人已发起企业访谈与供应关系核验。',
    tone: 'warning',
  },
  {
    time: '待完成',
    title: '形成处置结论并回挂风险事件',
    content: '需补充替代供应商评估结果和重点企业影响清单。',
    tone: 'muted',
  },
]

async function handleRisk() {
  try {
    const { value } = await ElMessageBox.prompt('请填写本次处置动作与初步结论', '风险处置', {
      confirmButtonText: '提交处置记录',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '例如：已联系企业核验采购结构，要求一周内提交替代供应方案。',
    })
    if (value) ElMessage.success('处置记录已提交，审计追踪号已生成')
  } catch {
    // 用户取消
  }
}

async function escalate() {
  try {
    await ElMessageBox.confirm('升级后将通知专班负责人，并缩短处置时限，是否继续？', '升级风险', {
      confirmButtonText: '确认升级',
      cancelButtonText: '取消',
      type: 'warning',
    })
    ElMessage.success('风险已升级至专班处理')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="back-line">
      <el-button text :icon="ArrowLeft" @click="router.push('/monitoring/risks')">
        返回风险清单
      </el-button>
      <span>风险编号 {{ risk.id }}</span>
    </div>

    <PageHeader
      :title="risk.title"
      :description="`${risk.enterprise} · ${risk.region} · ${risk.chainNode}`"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #badge>
        <RiskTag :level="risk.level" />
        <StatusBadge :status="risk.status" />
      </template>
      <template #actions>
        <el-button :icon="Bell">订阅动态</el-button>
        <el-button :icon="Share" @click="evidenceVisible = true">查看证据</el-button>
        <el-button type="warning" :icon="Promotion" @click="escalate">升级处置</el-button>
        <el-button type="primary" @click="handleRisk">记录处置</el-button>
      </template>
    </PageHeader>

    <div class="risk-detail-top">
      <section class="risk-score-card">
        <div
          class="risk-score-orb"
          :style="{ '--risk-color': riskColor(risk.level) }"
        >
          <strong>{{ risk.score }}</strong>
          <span>风险评分</span>
        </div>
        <div class="risk-score-copy">
          <span>当前判定</span>
          <h2>{{ risk.level }} · {{ risk.level === 'R5' ? '重大风险' : risk.level === 'R4' ? '高风险' : '较高风险' }}</h2>
          <p>{{ risk.summary }}</p>
          <div>
            <span>发现时间 {{ risk.detectedAt }}</span>
            <span>负责人 {{ risk.owner }}</span>
          </div>
        </div>
      </section>
      <section class="risk-impact-card">
        <div class="impact-head">
          <span>影响评估</span>
          <i>模型 V2.6</i>
        </div>
        <div class="impact-grid">
          <div><strong>42</strong><span>关联企业</span></div>
          <div><strong>3</strong><span>产业链节点</span></div>
          <div><strong>90</strong><span>影响天数</span></div>
          <div><strong>18%</strong><span>算力缺口</span></div>
        </div>
        <div class="impact-bar">
          <span>业务影响程度</span>
          <i><b :style="{ width: `${risk.score}%` }" /></i>
          <strong>{{ risk.score >= 80 ? '严重' : '较高' }}</strong>
        </div>
      </section>
    </div>

    <div class="risk-detail-main">
      <div class="detail-left">
        <DataCard title="风险说明" subtitle="事件背景与关键判断">
          <div class="narrative">
            <p>
              风险模型检测到核心算力芯片的头部供应商采购占比连续三个月上升，当前单一来源依赖度达到
              68%。该节点处于人工智能产业链的关键上游，向下游芯片设计、智算中心和基础大模型企业传导。
            </p>
            <p>
              在供应中断情景下，预计 42 家企业在未来 90 天内受到不同程度影响，其中 7 家重点企业的
              算力扩容计划可能延期。建议在确认供应关系的同时，启动国产芯片适配与备选供应商验证。
            </p>
          </div>
          <div class="judgement-list">
            <div>
              <span>01</span>
              <div><strong>风险来源</strong><p>单一供应商采购占比 68%，连续三个月高于 60% 预警阈值。</p></div>
            </div>
            <div>
              <span>02</span>
              <div><strong>传导路径</strong><p>AI 芯片 → 智算中心 → 基础大模型 / 智能驾驶企业。</p></div>
            </div>
            <div>
              <span>03</span>
              <div><strong>建议动作</strong><p>开展供应关系核验，建立 2 家备选供应商，评估国产替代周期。</p></div>
            </div>
          </div>
        </DataCard>

        <DataCard title="处置时间线" subtitle="所有操作均记录操作人、时间与追踪号">
          <div class="risk-timeline">
            <div v-for="(item, index) in timeline" :key="item.title" class="timeline-item">
              <div class="timeline-axis">
                <span :class="`is-${item.tone}`" />
                <i v-if="index < timeline.length - 1" />
              </div>
              <div>
                <time>{{ item.time }}</time>
                <strong>{{ item.title }}</strong>
                <p>{{ item.content }}</p>
              </div>
            </div>
          </div>
        </DataCard>
      </div>

      <div class="detail-right">
        <DataCard title="关联对象" subtitle="企业、节点与政策">
          <div class="related-object">
            <span class="object-type">企业</span>
            <strong>{{ risk.enterprise }}</strong>
            <small>重点企业 · {{ risk.region }}</small>
          </div>
          <div class="related-object">
            <span class="object-type">产业链节点</span>
            <strong>{{ risk.chainNode }}</strong>
            <small>中游关键环节 · 186 家企业</small>
          </div>
          <div class="related-object">
            <span class="object-type">相关政策</span>
            <strong>人工智能算力基础设施建设支持措施</strong>
            <small>北京市经信局 · 2026-08-12</small>
          </div>
        </DataCard>

        <DataCard title="证据摘要" subtitle="关键结论绑定 4 条证据">
          <template #actions>
            <el-button text size="small" @click="evidenceVisible = true">全部证据</el-button>
          </template>
          <div class="evidence-mini-list">
            <button
              v-for="item in evidence.slice(0, 3)"
              :key="item.id"
              type="button"
              @click="evidenceVisible = true"
            >
              <span>{{ item.sourceType }}</span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.publishedAt }} · {{ item.trustLevel }} 级</small>
            </button>
          </div>
        </DataCard>

        <DataCard title="处置建议" subtitle="按优先级排序">
          <div class="suggestion-list">
            <div><span>高</span><p>一周内完成重点企业供应关系核验。</p></div>
            <div><span>中</span><p>推动备选供应商技术验证与产能评估。</p></div>
            <div><span>中</span><p>将风险节点纳入周度产业链监测。</p></div>
          </div>
        </DataCard>
      </div>
    </div>

    <div class="risk-alert-note">
      <el-icon><Warning /></el-icon>
      <span>该风险关联业务敏感数据，原始证据仅对授权用户开放；对外引用前需完成专家审核。</span>
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="evidence" title="风险证据与数据来源" />
  </div>
</template>

<style scoped>
.back-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8d99aa;
  font-size: 9px;
}

.risk-detail-top {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 16px;
}

.risk-score-card {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 20px 22px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.risk-score-orb {
  display: flex;
  width: 112px;
  height: 112px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background:
    radial-gradient(circle at center, #fff 55%, transparent 56%),
    conic-gradient(var(--risk-color) 0 86%, #eef2f7 86% 100%);
  border-radius: 50%;
}

.risk-score-orb strong {
  color: var(--risk-color);
  font-family: Georgia, serif;
  font-size: 32px;
  font-weight: 500;
}

.risk-score-orb span {
  color: #8b97a8;
  font-size: 8px;
}

.risk-score-copy {
  min-width: 0;
}

.risk-score-copy > span {
  color: #8995a6;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.risk-score-copy h2 {
  margin: 5px 0 7px;
  color: #283c55;
  font-size: 18px;
  font-weight: 620;
}

.risk-score-copy p {
  max-width: 680px;
  margin: 0;
  color: #738297;
  font-size: 10px;
  line-height: 1.75;
}

.risk-score-copy > div {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 11px;
  color: #929dad;
  font-size: 8px;
}

.risk-impact-card {
  padding: 17px 18px;
  background:
    radial-gradient(circle at 100% 0%, rgba(223, 79, 86, 0.06), transparent 30%),
    #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.impact-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5d6d82;
  font-size: 10px;
  font-weight: 600;
}

.impact-head i {
  color: #98a3b1;
  font-size: 8px;
  font-style: normal;
  font-weight: 400;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin: 12px 0;
  overflow: hidden;
  background: #e8eef5;
  border: 1px solid #e8eef5;
  border-radius: 7px;
}

.impact-grid > div {
  padding: 9px 5px;
  background: #fafbfd;
  text-align: center;
}

.impact-grid strong,
.impact-grid span {
  display: block;
}

.impact-grid strong {
  color: #344a62;
  font-size: 17px;
  font-weight: 620;
}

.impact-grid span {
  margin-top: 2px;
  color: #919dad;
  font-size: 7px;
}

.impact-bar {
  display: grid;
  grid-template-columns: 72px 1fr 28px;
  align-items: center;
  gap: 7px;
  color: #7f8c9e;
  font-size: 8px;
}

.impact-bar i {
  height: 5px;
  overflow: hidden;
  background: #eef2f7;
  border-radius: 5px;
}

.impact-bar b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #e3aa4d, #df4f56);
  border-radius: 5px;
}

.impact-bar strong {
  color: #c64a51;
  font-size: 8px;
  text-align: right;
}

.risk-detail-main {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(310px, 0.65fr);
  gap: 16px;
}

.detail-left,
.detail-right {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.narrative p {
  margin: 0 0 10px;
  color: #5f6f84;
  font-size: 10.5px;
  line-height: 1.9;
}

.judgement-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.judgement-list > div {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 11px;
  background: #f8fafc;
  border-radius: 7px;
}

.judgement-list > div > span {
  color: #9eb2c8;
  font-family: Georgia, serif;
  font-size: 14px;
}

.judgement-list strong {
  display: block;
  color: #3b4d64;
  font-size: 9.5px;
  font-weight: 580;
}

.judgement-list p {
  margin: 3px 0 0;
  color: #8693a5;
  font-size: 8.5px;
  line-height: 1.55;
}

.risk-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: grid;
  grid-template-columns: 25px 1fr;
  gap: 9px;
}

.timeline-axis {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.timeline-axis span {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  margin-top: 4px;
  background: #b2c1d1;
  border-radius: 50%;
}

.timeline-axis span.is-danger {
  background: #df4f56;
  box-shadow: 0 0 0 4px rgba(223, 79, 86, 0.08);
}

.timeline-axis span.is-primary {
  background: #1769e0;
}

.timeline-axis span.is-warning {
  background: #e5a11a;
}

.timeline-axis i {
  width: 1px;
  flex: 1;
  margin: 4px 0;
  background: #e3e9f0;
}

.timeline-item > div:last-child {
  padding-bottom: 17px;
}

.timeline-item time {
  color: #99a4b2;
  font-size: 7.5px;
}

.timeline-item strong {
  display: block;
  margin: 3px 0;
  color: #3d5068;
  font-size: 9.5px;
  font-weight: 560;
}

.timeline-item p {
  margin: 0;
  color: #8794a6;
  font-size: 8.5px;
  line-height: 1.6;
}

.related-object {
  padding: 9px 0;
  border-bottom: 1px solid #edf1f6;
}

.related-object:last-child {
  border-bottom: 0;
}

.object-type {
  display: inline-block;
  padding: 2px 5px;
  margin-bottom: 4px;
  color: #66809c;
  background: #f1f5f9;
  border-radius: 3px;
  font-size: 7px;
}

.related-object strong,
.related-object small {
  display: block;
}

.related-object strong {
  color: #3b4d64;
  font-size: 9.5px;
  font-weight: 550;
  line-height: 1.5;
}

.related-object small {
  margin-top: 2px;
  color: #929dad;
  font-size: 7.5px;
}

.evidence-mini-list {
  display: flex;
  flex-direction: column;
}

.evidence-mini-list button {
  padding: 9px 0;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.evidence-mini-list button:last-child {
  border-bottom: 0;
}

.evidence-mini-list span {
  display: inline-block;
  padding: 1px 4px;
  margin-bottom: 3px;
  color: #657d97;
  background: #f1f5f9;
  border-radius: 3px;
  font-size: 7px;
}

.evidence-mini-list strong,
.evidence-mini-list small {
  display: block;
}

.evidence-mini-list strong {
  color: #40536b;
  font-size: 8.5px;
  font-weight: 520;
  line-height: 1.55;
}

.evidence-mini-list small {
  margin-top: 3px;
  color: #99a4b2;
  font-size: 7px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.suggestion-list > div {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.suggestion-list span {
  flex-shrink: 0;
  padding: 1px 4px;
  color: #ba7e0a;
  background: #fff7e8;
  border-radius: 3px;
  font-size: 7px;
}

.suggestion-list p {
  margin: 0;
  color: #6f7d91;
  font-size: 8.5px;
  line-height: 1.55;
}

.risk-alert-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  color: #8c7041;
  background: #fffaf0;
  border: 1px solid #f2e5c9;
  border-radius: 8px;
  font-size: 8.5px;
}

.risk-alert-note .el-icon {
  color: #d59a2f;
}

@media (max-width: 1000px) {
  .risk-detail-top,
  .risk-detail-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .risk-score-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
