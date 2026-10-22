<script setup lang="ts">
import {
  ArrowLeft,
  Check,
  Close,
  DocumentChecked,
  Promotion,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, evidence, reviewTasks, topicPreview } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const activeEvidence = ref(0)
const evidenceVisible = ref(false)
const comment = ref('')
const submitting = ref(false)

const task = computed(
  () => reviewTasks.find((item) => item.id === route.params.id) || reviewTasks[0],
)

const reviewChecks = ref([
  { label: '核心结论均有证据支持', checked: true },
  { label: '指标口径与数据版本一致', checked: true },
  { label: '图表与正文数据一致', checked: true },
  { label: '风险与限制说明充分', checked: false },
  { label: '低可信度内容已标注', checked: true },
])

const aiIssues = [
  { level: 'warning', title: '1 条图谱关系待核验', detail: 'AI 芯片供应关系尚未完成企业侧确认，建议在报告中说明。' },
  { level: 'info', title: '融资数据存在时效偏差', detail: '融资事件库最近同步时间为 2 个工作日前。' },
  { level: 'pass', title: '核心指标证据完整', detail: '营收、企业数量和专利数据均绑定 A 级证据。' },
]

async function approve() {
  if (!reviewChecks.value.every((item) => item.checked)) {
    ElMessage.warning('请完成全部审核检查项后再通过')
    return
  }
  try {
    await ElMessageBox.confirm('审核通过后报告将进入发布流程，是否确认提交？', '审核通过', {
      type: 'success',
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
    })
    submitting.value = true
    setTimeout(() => {
      ElMessage.success('审核已通过，报告已进入发布流程')
      router.push('/reviews/records')
    }, 500)
  } catch {
    // 取消
  }
}

async function returnReport() {
  try {
    const { value } = await ElMessageBox.prompt(
      '请填写退回修改的具体原因',
      '退回修改',
      {
        confirmButtonText: '退回',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请说明需要补充的证据、数据或修改内容。',
      },
    )
    if (value) {
      ElMessage.success('报告已退回修改，审核意见已通知提交人')
      router.push('/reviews/records')
    }
  } catch {
    // 取消
  }
}

function saveComment() {
  if (!comment.value.trim()) {
    ElMessage.warning('请输入审核意见')
    return
  }
  ElMessage.success('审核意见已保存')
  comment.value = ''
}
</script>

<template>
  <div class="page-shell">
    <div class="back-line">
      <el-button text :icon="ArrowLeft" @click="router.push('/reviews/tasks')">
        返回待审核任务
      </el-button>
      <span>{{ task.id }} · 领取于 10:08</span>
    </div>

    <PageHeader
      :title="task.title"
      :description="`${task.type} · 提交人 ${task.submitter} · 截止 ${task.deadline}`"
      :data-version="dataVersion"
      updated-at="2026-10-18 09:20"
    >
      <template #badge>
        <RiskTag :level="task.risk" />
        <StatusBadge :status="task.status" />
      </template>
      <template #actions>
        <el-button :icon="Close" type="danger" plain @click="returnReport">退回修改</el-button>
        <el-button :icon="Check" type="success" :loading="submitting" @click="approve">
          审核通过
        </el-button>
      </template>
    </PageHeader>

    <div class="workbench-grid">
      <aside class="review-report">
        <DataCard title="报告正文" subtitle="V1.3 · 6 个章节">
          <div class="report-outline">
            <button v-for="(section, index) in topicPreview.sections" :key="section.title" type="button">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div><strong>{{ section.title }}</strong><small>{{ section.content.slice(0, 28) }}…</small></div>
            </button>
          </div>
          <div class="report-excerpt">
            <span>摘要预览</span>
            <h3>{{ topicPreview.title }}</h3>
            <p>{{ topicPreview.summary }}</p>
            <div class="excerpt-meta">
              <span>数据版本 {{ dataVersion }}</span>
              <TrustBadge level="B" />
            </div>
          </div>
          <el-button plain size="small" class="open-report">打开完整报告</el-button>
        </DataCard>
      </aside>

      <main class="review-center">
        <DataCard title="证据核验" subtitle="选择证据查看原文、来源与关联结论">
          <div class="evidence-review">
            <div class="evidence-selector">
              <button
                v-for="(item, index) in evidence"
                :key="item.id"
                type="button"
                :class="{ 'is-active': activeEvidence === index }"
                @click="activeEvidence = index"
              >
                <span>{{ item.sourceType }}</span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.trustLevel }} 级</small>
              </button>
            </div>
            <div class="evidence-preview">
              <div class="evidence-preview__head">
                <div>
                  <span>{{ evidence[activeEvidence].source }}</span>
                  <h3>{{ evidence[activeEvidence].title }}</h3>
                </div>
                <TrustBadge :level="evidence[activeEvidence].trustLevel" />
              </div>
              <blockquote>{{ evidence[activeEvidence].snippet }}</blockquote>
              <div class="evidence-preview__meta">
                <span>发布时间 {{ evidence[activeEvidence].publishedAt }}</span>
                <span class="mono">{{ evidence[activeEvidence].id }}</span>
                <el-button text size="small" @click="evidenceVisible = true">打开原文</el-button>
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard title="审核检查项" subtitle="全部通过后方可提交审核结论">
          <div class="check-list">
            <label v-for="item in reviewChecks" :key="item.label">
              <el-checkbox v-model="item.checked" />
              <span>{{ item.label }}</span>
            </label>
          </div>
        </DataCard>

        <DataCard title="审核意见" subtitle="可逐条记录问题与修改建议">
          <el-input
            v-model="comment"
            type="textarea"
            :rows="3"
            placeholder="填写审核意见，例如：请补充 AI 芯片供应关系的企业侧确认证据，并在风险部分说明数据限制。"
          />
          <div class="comment-actions">
            <span>审核意见将写入不可删除的审核记录</span>
            <el-button type="primary" plain size="small" @click="saveComment">保存意见</el-button>
          </div>
        </DataCard>
      </main>

      <aside class="review-side">
        <DataCard title="AI 预审" subtitle="辅助检查，不替代专家判断">
          <div class="ai-issues">
            <div v-for="item in aiIssues" :key="item.title" :class="`is-${item.level}`">
              <span>{{ item.level === 'pass' ? '✓' : '!' }}</span>
              <div><strong>{{ item.title }}</strong><p>{{ item.detail }}</p></div>
            </div>
          </div>
        </DataCard>

        <DataCard title="可信度" subtitle="当前结论可信度 B">
          <div class="trust-card">
            <TrustBadge level="B" />
            <strong>84.2<small>综合评分</small></strong>
          </div>
          <div class="trust-dims">
            <div><span>数据完整性</span><b>96</b></div>
            <div><span>证据一致性</span><b>92</b></div>
            <div><span>来源可靠性</span><b>95</b></div>
            <div><span>模型置信度</span><b>88</b></div>
            <div><span>时效性</span><b>90</b></div>
          </div>
          <el-button text size="small" @click="router.push('/analysis/trust/TRUST-20261018-01')">
            查看可信度详情
          </el-button>
        </DataCard>

        <DataCard title="审核信息" subtitle="任务与提交人">
          <div class="review-info">
            <div><span>提交人</span><strong>{{ task.submitter }}</strong></div>
            <div><span>提交时间</span><strong>{{ task.submittedAt }}</strong></div>
            <div><span>证据数量</span><strong>{{ task.evidenceCount }} 条</strong></div>
            <div><span>报告版本</span><strong>V1.3</strong></div>
            <div><span>审核人</span><strong>当前用户</strong></div>
          </div>
        </DataCard>

        <div class="decision-actions">
          <el-button type="danger" plain @click="returnReport">
            <el-icon><Close /></el-icon>
            退回修改
          </el-button>
          <el-button type="success" @click="approve">
            <el-icon><Check /></el-icon>
            审核通过
          </el-button>
        </div>
      </aside>
    </div>

    <div class="workbench-note">
      <el-icon><DocumentChecked /></el-icon>
      <span>审核结论提交后将写入审核档案并同步更新报告状态；正式发布前不得修改已审核内容。</span>
      <el-button text size="small">
        查看审核规范
        <el-icon><Promotion /></el-icon>
      </el-button>
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="[evidence[activeEvidence]]" title="证据原文" />
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

.workbench-grid {
  display: grid;
  grid-template-columns: 255px minmax(0, 1fr) 270px;
  align-items: start;
  gap: 14px;
}

.review-report,
.review-side {
  display: flex;
  position: sticky;
  top: 84px;
  flex-direction: column;
  gap: 13px;
}

.report-outline {
  display: flex;
  flex-direction: column;
}

.report-outline button {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 2px;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.report-outline span {
  color: #a3b4c7;
  font-family: Georgia, serif;
  font-size: 9px;
}

.report-outline strong,
.report-outline small {
  display: block;
}

.report-outline strong {
  color: #4b5e75;
  font-size: 7.5px;
  font-weight: 520;
}

.report-outline small {
  overflow: hidden;
  max-width: 180px;
  margin-top: 2px;
  color: #9aa5b3;
  font-size: 6.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-excerpt {
  padding: 10px;
  margin-top: 10px;
  background: #f7fafd;
  border-radius: 6px;
}

.report-excerpt > span {
  color: #7c8ba0;
  font-size: 6.5px;
  font-weight: 600;
}

.report-excerpt h3 {
  margin: 4px 0;
  color: #3d5068;
  font-family: "Songti SC", serif;
  font-size: 9px;
  line-height: 1.45;
}

.report-excerpt p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #7c899b;
  font-size: 7px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.excerpt-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 7px;
  color: #9ba5b3;
  font-size: 6px;
}

.open-report {
  width: 100%;
  margin-top: 8px;
}

.review-center {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.evidence-review {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 10px;
}

.evidence-selector {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.evidence-selector button {
  padding: 8px;
  text-align: left;
  background: #fafcfe;
  border: 1px solid #e7edf5;
  border-radius: 6px;
  cursor: pointer;
}

.evidence-selector button:hover,
.evidence-selector button.is-active {
  background: #f4f9ff;
  border-color: #a9c8e9;
}

.evidence-selector span {
  padding: 1px 4px;
  color: #5d7792;
  background: #edf3f9;
  border-radius: 3px;
  font-size: 6px;
}

.evidence-selector strong,
.evidence-selector small {
  display: block;
}

.evidence-selector strong {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 4px;
  color: #43566e;
  font-size: 7px;
  font-weight: 520;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.evidence-selector small {
  margin-top: 2px;
  color: #9aa5b3;
  font-size: 6px;
}

.evidence-preview {
  padding: 12px;
  background: #fbfcfe;
  border: 1px solid #e7edf5;
  border-radius: 7px;
}

.evidence-preview__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 9px;
}

.evidence-preview__head > div {
  min-width: 0;
}

.evidence-preview__head span {
  color: #8d99a9;
  font-size: 6.5px;
}

.evidence-preview__head h3 {
  margin: 4px 0 0;
  color: #3d5068;
  font-size: 8.5px;
  font-weight: 550;
  line-height: 1.45;
}

.evidence-preview blockquote {
  padding: 9px 10px;
  margin: 10px 0;
  color: #5d6f85;
  background: #fff;
  border-left: 3px solid #d9b35f;
  font-family: "Songti SC", serif;
  font-size: 8px;
  line-height: 1.8;
}

.evidence-preview__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #98a3b2;
  font-size: 6.5px;
}

.evidence-preview__meta button {
  margin-left: auto;
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.check-list label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.check-list span {
  color: #596a80;
  font-size: 8px;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.comment-actions span {
  color: #98a3b2;
  font-size: 6.5px;
}

.ai-issues {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ai-issues > div {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px;
  border-radius: 6px;
}

.ai-issues > div > span {
  display: flex;
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 6px;
}

.ai-issues .is-warning {
  background: #fff9ec;
}

.ai-issues .is-warning > span {
  color: #fff;
  background: #e5a11a;
}

.ai-issues .is-info {
  background: #f4f8fd;
}

.ai-issues .is-info > span {
  color: #fff;
  background: #5b8fc7;
}

.ai-issues .is-pass {
  background: #f0faf7;
}

.ai-issues .is-pass > span {
  color: #fff;
  background: #0ba58a;
}

.ai-issues strong {
  display: block;
  color: #4d5f75;
  font-size: 7.5px;
  font-weight: 550;
}

.ai-issues p {
  margin: 2px 0 0;
  color: #8a96a7;
  font-size: 6.5px;
  line-height: 1.5;
}

.trust-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px;
  background: #f5f9fe;
  border-radius: 6px;
}

.trust-card > strong {
  color: #1769e0;
  font-size: 17px;
  font-weight: 620;
}

.trust-card small {
  display: block;
  color: #8e9aaa;
  font-size: 6px;
  font-weight: 400;
}

.trust-dims {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 9px 0;
}

.trust-dims > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7f8d9f;
  font-size: 7px;
}

.trust-dims b {
  color: #4d637b;
  font-weight: 550;
}

.review-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.review-info > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.review-info span {
  color: #8d99a9;
  font-size: 7px;
}

.review-info strong {
  color: #4b5e75;
  font-size: 7px;
  font-weight: 520;
}

.decision-actions {
  display: flex;
  gap: 6px;
}

.decision-actions .el-button {
  flex: 1;
  margin: 0;
}

.workbench-note {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
  color: #7e8c9e;
  background: #f7fafc;
  border-radius: 6px;
  font-size: 7px;
}

@media (max-width: 1150px) {
  .workbench-grid {
    grid-template-columns: 230px minmax(0, 1fr);
  }

  .review-side {
    position: static;
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .decision-actions {
    grid-column: span 3;
  }
}

@media (max-width: 760px) {
  .workbench-grid {
    grid-template-columns: 1fr;
  }

  .review-report,
  .review-side {
    position: static;
    grid-column: auto;
    display: flex;
  }

  .evidence-review {
    grid-template-columns: 1fr;
  }
}
</style>
