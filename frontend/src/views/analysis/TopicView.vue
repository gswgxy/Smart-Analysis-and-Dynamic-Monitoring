<script setup lang="ts">
import {
  CircleCheck,
  DocumentAdd,
  MagicStick,
  Refresh,
  Right,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, evidence, topicPreview, topicTemplates, updatedAt } from '@/mock/data'

const router = useRouter()
const selectedTemplate = ref(topicTemplates[0].id)
const industry = ref('人工智能')
const region = ref('北京市')
const period = ref('2026年10月')
const depth = ref('标准研判')
const generating = ref(false)
const progress = ref(0)
const generated = ref(true)
const evidenceVisible = ref(false)
let progressTimer: ReturnType<typeof setInterval> | null = null

const template = computed(
  () => topicTemplates.find((item) => item.id === selectedTemplate.value) || topicTemplates[0],
)

const checklist = [
  '产业运行总览与核心指标',
  '创新、资本与市场活跃度',
  '产业链关键节点与薄弱环节',
  '重点风险与影响对象',
  '政策依据与专家建议',
]

function generate() {
  if (generating.value) return
  generating.value = true
  generated.value = false
  progress.value = 8
  progressTimer = setInterval(() => {
    progress.value = Math.min(progress.value + Math.ceil(Math.random() * 13), 96)
  }, 420)

  setTimeout(() => {
    if (progressTimer) clearInterval(progressTimer)
    progressTimer = null
    progress.value = 100
    generating.value = false
    generated.value = true
    ElMessage.success('专题初稿已生成，已绑定 3 条关键证据')
  }, 2600)
}

function reset() {
  generated.value = true
  progress.value = 0
  ElMessage.info('已恢复当前专题草稿')
}

onBeforeUnmount(() => {
  if (progressTimer) clearInterval(progressTimer)
})
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="专题研判"
      description="选择专题模板与研判参数，调用指标、图谱、政策和证据服务生成结构化专题初稿，支持编辑与送审。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Refresh" @click="reset">恢复草稿</el-button>
        <el-button :icon="DocumentAdd" @click="router.push('/reports/editor/NEW')">
          进入编辑
        </el-button>
        <el-button type="primary" :icon="MagicStick" :loading="generating" @click="generate">
          生成专题
        </el-button>
      </template>
    </PageHeader>

    <FilterBar label="专题范围">
      <el-select v-model="industry" style="width: 145px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
        <el-option label="智能网联汽车" value="智能网联汽车" />
      </el-select>
      <el-select v-model="region" style="width: 125px">
        <el-option label="北京市" value="北京市" />
        <el-option label="海淀区" value="海淀区" />
        <el-option label="经开区" value="经开区" />
      </el-select>
      <el-select v-model="period" style="width: 135px">
        <el-option label="2026年10月" value="2026年10月" />
        <el-option label="2026年第三季度" value="2026年第三季度" />
        <el-option label="近12个月" value="近12个月" />
      </el-select>
      <el-select v-model="depth" style="width: 125px">
        <el-option label="标准研判" value="标准研判" />
        <el-option label="深度研判" value="深度研判" />
        <el-option label="快速摘要" value="快速摘要" />
      </el-select>
    </FilterBar>

    <div class="topic-layout">
      <div class="topic-config">
        <DataCard title="选择专题模板" subtitle="模板已预置章节、分析方法与报告结构">
          <div class="template-list">
            <button
              v-for="item in topicTemplates"
              :key="item.id"
              type="button"
              class="template-card"
              :class="{ 'is-selected': selectedTemplate === item.id }"
              @click="selectedTemplate = item.id"
            >
              <div class="template-card__icon">{{ item.id.slice(6, 8).toUpperCase() }}</div>
              <div class="template-card__copy">
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.tag }}</span>
                </div>
                <p>{{ item.description }}</p>
                <small>{{ item.chapters }} 个章节 · 更新于 {{ item.updated }}</small>
              </div>
              <el-icon v-if="selectedTemplate === item.id" class="template-check">
                <CircleCheck />
              </el-icon>
            </button>
          </div>
        </DataCard>

        <DataCard title="研判设置" subtitle="设置报告篇幅、证据要求和输出偏好">
          <div class="setting-list">
            <div>
              <label>报告篇幅</label>
              <el-radio-group model-value="标准" size="small">
                <el-radio-button value="精简">精简</el-radio-button>
                <el-radio-button value="标准">标准</el-radio-button>
                <el-radio-button value="深度">深度</el-radio-button>
              </el-radio-group>
            </div>
            <div>
              <label>数据范围</label>
              <el-checkbox-group :model-value="['指标', '图谱', '政策', '舆情']" size="small">
                <el-checkbox value="指标">指标</el-checkbox>
                <el-checkbox value="图谱">图谱</el-checkbox>
                <el-checkbox value="政策">政策</el-checkbox>
                <el-checkbox value="舆情">舆情</el-checkbox>
              </el-checkbox-group>
            </div>
            <div>
              <label>可信度要求</label>
              <el-select model-value="B 级及以上" size="small" style="width: 160px">
                <el-option label="B 级及以上" value="B 级及以上" />
                <el-option label="仅 A 级" value="仅 A 级" />
              </el-select>
            </div>
            <div>
              <label>输出格式</label>
              <el-select model-value="DOCX + 图表" size="small" style="width: 160px">
                <el-option label="DOCX + 图表" value="DOCX + 图表" />
                <el-option label="仅在线报告" value="仅在线报告" />
              </el-select>
            </div>
          </div>
          <div class="checklist">
            <strong>将自动分析</strong>
            <div v-for="item in checklist" :key="item">
              <el-icon><CircleCheck /></el-icon>
              {{ item }}
            </div>
          </div>
        </DataCard>
      </div>

      <div class="topic-preview">
        <div v-if="generating" class="generation-state">
          <div class="generation-orb">
            <el-icon><MagicStick /></el-icon>
          </div>
          <h2>正在生成专题研判</h2>
          <p>正在检索指标与图谱关系，生成结论并核对证据…</p>
          <el-progress :percentage="progress" :stroke-width="6" :show-text="false" />
          <div class="generation-steps">
            <span :class="{ 'is-done': progress > 20 }">指标聚合</span>
            <span :class="{ 'is-done': progress > 48 }">图谱分析</span>
            <span :class="{ 'is-done': progress > 70 }">政策检索</span>
            <span :class="{ 'is-done': progress >= 100 }">证据绑定</span>
          </div>
        </div>

        <template v-else-if="generated">
          <div class="preview-head">
            <div>
              <span>专题预览 · {{ template.title }}</span>
              <h1>{{ topicPreview.title }}</h1>
              <div class="preview-meta">
                <span>生成时间 2026-10-18 09:56</span>
                <span>数据版本 {{ dataVersion }}</span>
                <TrustBadge :level="topicPreview.trustLevel" />
              </div>
            </div>
            <div class="preview-actions">
              <el-button size="small" @click="evidenceVisible = true">证据 3</el-button>
              <el-button size="small" type="primary" plain @click="router.push('/reports/editor/NEW')">
                编辑
              </el-button>
            </div>
          </div>

          <div class="preview-summary">
            <span>核心判断</span>
            <p>{{ topicPreview.summary }}</p>
          </div>

          <article class="report-preview">
            <section v-for="(section, index) in topicPreview.sections" :key="section.title">
              <div class="section-number">{{ String(index + 1).padStart(2, '0') }}</div>
              <div>
                <h2>{{ section.title }}</h2>
                <p>{{ section.content }}</p>
              </div>
            </section>
          </article>

          <div class="preview-evidence">
            <div class="preview-evidence__head">
              <strong>关键证据</strong>
              <button type="button" @click="evidenceVisible = true">查看全部</button>
            </div>
            <div class="preview-evidence__list">
              <button
                v-for="item in evidence.slice(0, 3)"
                :key="item.id"
                type="button"
                @click="evidenceVisible = true"
              >
                <span>{{ item.sourceType }}</span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.trustLevel }} 级 · {{ item.publishedAt }}</small>
              </button>
            </div>
          </div>

          <div class="preview-footer">
            <span>专题初稿由 AI 生成，正式发布前必须完成专家审核。</span>
            <el-button type="primary" @click="router.push('/reviews/workbench/REV-20261018-003')">
              提交审核
              <el-icon><Right /></el-icon>
            </el-button>
          </div>
        </template>
      </div>
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="evidence" title="专题研判证据" />
  </div>
</template>

<style scoped>
.topic-layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  align-items: start;
  gap: 16px;
}

.topic-config {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.template-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px;
  text-align: left;
  background: #fafcfe;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  cursor: pointer;
}

.template-card:hover,
.template-card.is-selected {
  background: #f4f9ff;
  border-color: #a9c8e9;
}

.template-card__icon {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #4f79a3;
  background: #eaf2fa;
  border-radius: 7px;
  font-size: 8px;
  font-weight: 600;
}

.template-card__copy {
  min-width: 0;
  flex: 1;
}

.template-card__copy > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.template-card__copy strong {
  color: #354960;
  font-size: 9px;
  font-weight: 570;
}

.template-card__copy span {
  padding: 1px 4px;
  color: #5a7898;
  background: #edf3f9;
  border-radius: 3px;
  font-size: 6px;
}

.template-card__copy p {
  margin: 4px 0;
  color: #8491a3;
  font-size: 7.5px;
  line-height: 1.5;
}

.template-card__copy small {
  color: #9ba5b3;
  font-size: 6.5px;
}

.template-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #1769e0;
  font-size: 12px;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.setting-list label {
  color: #68788d;
  font-size: 8px;
}

.setting-list :deep(.el-checkbox__label),
.setting-list :deep(.el-radio-button__inner) {
  font-size: 8px;
}

.checklist {
  padding: 10px;
  margin-top: 13px;
  background: #f8fafc;
  border-radius: 7px;
}

.checklist strong {
  display: block;
  margin-bottom: 6px;
  color: #627389;
  font-size: 8px;
  font-weight: 570;
}

.checklist div {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  color: #8491a2;
  font-size: 7.5px;
}

.checklist .el-icon {
  color: #0ba58a;
  font-size: 9px;
}

.topic-preview {
  min-height: 760px;
  padding: 24px 27px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.generation-state {
  display: flex;
  min-height: 680px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 40px;
}

.generation-orb {
  display: flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  background: #edf5ff;
  border: 1px solid #d8e8fa;
  border-radius: 20px;
  font-size: 26px;
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    transform: scale(1.06);
    box-shadow: 0 0 0 12px rgba(23, 105, 224, 0.05);
  }
}

.generation-state h2 {
  margin: 17px 0 6px;
  color: #2e435b;
  font-size: 17px;
  font-weight: 620;
}

.generation-state p {
  margin: 0 0 24px;
  color: #8491a3;
  font-size: 9px;
}

.generation-state :deep(.el-progress) {
  width: 320px;
}

.generation-steps {
  display: flex;
  gap: 15px;
  margin-top: 12px;
  color: #a0aab8;
  font-size: 7px;
}

.generation-steps .is-done {
  color: #0a9275;
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8edf4;
}

.preview-head > div:first-child > span {
  color: #8a97a8;
  font-size: 7.5px;
  letter-spacing: 0.06em;
}

.preview-head h1 {
  margin: 7px 0 7px;
  color: #21364f;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 21px;
  font-weight: 650;
  line-height: 1.45;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  color: #929dad;
  font-size: 7.5px;
}

.preview-actions {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
}

.preview-summary {
  padding: 12px 14px;
  margin: 16px 0 20px;
  background: #f4f9ff;
  border-left: 3px solid #1769e0;
  border-radius: 0 7px 7px 0;
}

.preview-summary span {
  color: #1769e0;
  font-size: 7.5px;
  font-weight: 600;
}

.preview-summary p {
  margin: 5px 0 0;
  color: #4f657e;
  font-size: 9px;
  line-height: 1.7;
}

.report-preview {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.report-preview section {
  display: grid;
  grid-template-columns: 27px 1fr;
  gap: 9px;
}

.section-number {
  color: #a9bdcf;
  font-family: Georgia, serif;
  font-size: 13px;
}

.report-preview h2 {
  margin: 0 0 6px;
  color: #2e435b;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 13px;
  font-weight: 650;
}

.report-preview p {
  margin: 0;
  color: #5d6e83;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 9.5px;
  line-height: 2;
  text-align: justify;
}

.preview-evidence {
  padding: 13px;
  margin-top: 22px;
  background: #fbfcfe;
  border: 1px solid #e7edf4;
  border-radius: 8px;
}

.preview-evidence__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preview-evidence__head strong {
  color: #4b5f76;
  font-size: 8.5px;
  font-weight: 580;
}

.preview-evidence__head button {
  color: #1769e0;
  background: transparent;
  border: 0;
  font-size: 7.5px;
  cursor: pointer;
}

.preview-evidence__list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.preview-evidence__list button {
  padding: 7px;
  text-align: left;
  background: #fff;
  border: 1px solid #e8eef5;
  border-radius: 5px;
  cursor: pointer;
}

.preview-evidence__list span {
  padding: 1px 4px;
  color: #5d7792;
  background: #eff4f9;
  border-radius: 3px;
  font-size: 6px;
}

.preview-evidence__list strong,
.preview-evidence__list small {
  display: block;
}

.preview-evidence__list strong {
  overflow: hidden;
  margin-top: 4px;
  color: #43566e;
  font-size: 7px;
  font-weight: 520;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-evidence__list small {
  margin-top: 2px;
  color: #9ba5b3;
  font-size: 6px;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 17px;
  margin-top: 17px;
  border-top: 1px solid #e8edf4;
}

.preview-footer > span {
  color: #939ead;
  font-size: 7.5px;
}

@media (max-width: 1100px) {
  .topic-layout {
    grid-template-columns: 1fr;
  }

  .topic-config {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .topic-config {
    grid-template-columns: 1fr;
  }

  .topic-preview {
    padding: 18px;
  }

  .preview-head {
    flex-direction: column;
  }

  .preview-evidence__list {
    grid-template-columns: 1fr;
  }
}
</style>
