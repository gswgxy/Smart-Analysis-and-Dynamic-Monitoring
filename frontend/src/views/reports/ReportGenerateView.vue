<script setup lang="ts">
import {
  ArrowDown,
  ArrowUp,
  Check,
  DocumentAdd,
  MagicStick,
  Right,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, topicTemplates, updatedAt } from '@/mock/data'

const router = useRouter()
const reportType = ref('产业月报')
const selectedTemplate = ref('topic-monthly')
const selectedSources = ref([
  '北京市人工智能产业运行月报（2026年10月）',
  'AI 芯片供应链风险专题研判',
  '中关村人工智能产业集聚区发展观察',
])
const generating = ref(false)
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const chapters = ref([
  { title: '摘要与核心判断', enabled: true },
  { title: '产业运行总体情况', enabled: true },
  { title: '重点领域与产业链分析', enabled: true },
  { title: '风险与问题提示', enabled: true },
  { title: '政策依据与工作建议', enabled: true },
  { title: '附录：指标口径与数据来源', enabled: true },
])

const sourceOptions = [
  {
    title: '北京市人工智能产业运行月报（2026年10月）',
    type: '专题研判',
    owner: '张研',
    trust: 'B' as const,
  },
  {
    title: 'AI 芯片供应链风险专题研判',
    type: '风险分析',
    owner: '李析',
    trust: 'B' as const,
  },
  {
    title: '中关村人工智能产业集聚区发展观察',
    type: '区域分析',
    owner: '王园',
    trust: 'A' as const,
  },
  {
    title: '智能网联汽车产业链韧性评估',
    type: '韧性评估',
    owner: '赵韧',
    trust: 'B' as const,
  },
]

const reportTypes = ['产业月报', '风险专题', '区域分析', '企业分析', '韧性评估']

const template = computed(
  () => topicTemplates.find((item) => item.id === selectedTemplate.value) || topicTemplates[0],
)

function moveChapter(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= chapters.value.length) return
  const [item] = chapters.value.splice(index, 1)
  chapters.value.splice(target, 0, item)
}

function generateReport() {
  if (generating.value) return
  generating.value = true
  progress.value = 5
  timer = setInterval(() => {
    progress.value = Math.min(progress.value + 11, 95)
  }, 300)
  setTimeout(() => {
    if (timer) clearInterval(timer)
    timer = null
    progress.value = 100
    generating.value = false
    ElMessage.success('报告初稿已生成，共 6 个章节、18 条证据')
    router.push('/reports/editor/RPT-20261018-001')
  }, 2200)
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="报告生成"
      description="从已有分析结果中选择内容，绑定报告模板与章节，自动提取指标、图表、结论、证据和可信度。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="DocumentAdd" @click="router.push('/reports')">历史报告</el-button>
        <el-button type="primary" :icon="MagicStick" :loading="generating" @click="generateReport">
          生成报告初稿
        </el-button>
      </template>
    </PageHeader>

    <div class="generate-layout">
      <div class="generate-main">
        <DataCard title="01 · 报告类型" subtitle="选择报告用途与标准格式">
          <div class="type-grid">
            <button
              v-for="item in reportTypes"
              :key="item"
              type="button"
              :class="{ 'is-selected': reportType === item }"
              @click="reportType = item"
            >
              <span>{{ item }}</span>
              <el-icon v-if="reportType === item"><Check /></el-icon>
            </button>
          </div>
        </DataCard>

        <DataCard title="02 · 报告模板" subtitle="模板决定章节结构、图表样式与版式">
          <div class="template-grid">
            <button
              v-for="item in topicTemplates"
              :key="item.id"
              type="button"
              :class="{ 'is-selected': selectedTemplate === item.id }"
              @click="selectedTemplate = item.id"
            >
              <div class="template-preview">
                <span />
                <span />
                <span />
                <span />
              </div>
              <strong>{{ item.title }}</strong>
              <small>{{ item.chapters }} 章节 · {{ item.updated }}</small>
            </button>
          </div>
        </DataCard>

        <DataCard title="03 · 分析结果来源" subtitle="已授权的分析结果可复用于报告">
          <div class="source-list">
            <label v-for="item in sourceOptions" :key="item.title">
              <el-checkbox-group v-model="selectedSources">
                <el-checkbox :value="item.title" />
              </el-checkbox-group>
              <div>
                <strong>{{ item.title }}</strong>
                <span>{{ item.type }} · {{ item.owner }} · 最近更新 2026-10-18</span>
              </div>
              <TrustBadge :level="item.trust" />
            </label>
          </div>
          <template #footer>
            <div class="source-footer">
              <span>已选择 {{ selectedSources.length }} 项分析结果</span>
              <el-button text size="small">从分析结果库添加</el-button>
            </div>
          </template>
        </DataCard>

        <DataCard title="04 · 章节结构" subtitle="支持调整顺序并勾选是否纳入报告">
          <div class="chapter-list">
            <div v-for="(item, index) in chapters" :key="item.title">
              <span class="chapter-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <el-checkbox v-model="item.enabled" />
              <strong>{{ item.title }}</strong>
              <el-button
                text
                size="small"
                :icon="ArrowUp"
                :disabled="index === 0"
                @click="moveChapter(index, -1)"
              />
              <el-button
                text
                size="small"
                :icon="ArrowDown"
                :disabled="index === chapters.length - 1"
                @click="moveChapter(index, 1)"
              />
            </div>
          </div>
        </DataCard>
      </div>

      <aside class="generate-side">
        <DataCard title="生成配置" subtitle="报告摘要">
          <div class="config-summary">
            <div><span>报告类型</span><strong>{{ reportType }}</strong></div>
            <div><span>模板</span><strong>{{ template.title }}</strong></div>
            <div><span>分析结果</span><strong>{{ selectedSources.length }} 项</strong></div>
            <div><span>章节</span><strong>{{ chapters.filter((x) => x.enabled).length }} 个</strong></div>
            <div><span>预计篇幅</span><strong>约 18—24 页</strong></div>
          </div>
          <div class="generation-note">
            <span>生成内容</span>
            <div>指标图表 8 个</div>
            <div>关键结论 12 条</div>
            <div>证据引用 18 条</div>
            <div>可信度声明 1 份</div>
          </div>
          <el-button
            type="primary"
            size="large"
            class="generate-button"
            :loading="generating"
            @click="generateReport"
          >
            <el-icon v-if="!generating"><MagicStick /></el-icon>
            生成报告初稿
          </el-button>
          <el-progress
            v-if="generating"
            :percentage="progress"
            :stroke-width="5"
            :show-text="false"
            class="generation-progress"
          />
        </DataCard>

        <DataCard title="生成说明" subtitle="输出前请确认">
          <ul class="generation-rules">
            <li>报告内容来源于已授权分析结果。</li>
            <li>图表与指标使用同一数据版本。</li>
            <li>低可信度结论将自动添加限制说明。</li>
            <li>报告正式发布前必须完成专家审核。</li>
          </ul>
        </DataCard>

        <DataCard title="最近模板" subtitle="团队常用报告模板">
          <div class="recent-template">
            <span>产业月报模板 V3.2</span>
            <small>最近使用 12 分钟前</small>
          </div>
          <div class="recent-template">
            <span>风险专题模板 V2.6</span>
            <small>最近使用 1 小时前</small>
          </div>
          <el-button text size="small" @click="router.push('/admin/templates')">
            管理模板
            <el-icon><Right /></el-icon>
          </el-button>
        </DataCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.generate-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  align-items: start;
  gap: 16px;
}

.generate-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.type-grid button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  color: #5f7085;
  background: #f8fafc;
  border: 1px solid #e5ecf4;
  border-radius: 6px;
  font-size: 8.5px;
  cursor: pointer;
}

.type-grid button:hover,
.type-grid button.is-selected {
  color: #1769e0;
  background: #f1f7ff;
  border-color: #aac9eb;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
}

.template-grid > button {
  padding: 9px;
  text-align: left;
  background: #fafcfe;
  border: 1px solid #e6edf5;
  border-radius: 7px;
  cursor: pointer;
}

.template-grid > button:hover,
.template-grid > button.is-selected {
  background: #f3f9ff;
  border-color: #9fc2e7;
}

.template-preview {
  display: flex;
  height: 68px;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e9eef5;
  border-radius: 5px;
}

.template-preview span {
  display: block;
  height: 3px;
  background: #e7edf4;
  border-radius: 3px;
}

.template-preview span:first-child {
  width: 48%;
  height: 5px;
  margin-bottom: 3px;
  background: #b8d3ef;
}

.template-preview span:nth-child(3) {
  width: 76%;
}

.template-grid strong,
.template-grid small {
  display: block;
}

.template-grid strong {
  color: #3f5269;
  font-size: 8px;
  font-weight: 550;
}

.template-grid small {
  margin-top: 3px;
  color: #98a3b2;
  font-size: 6.5px;
}

.source-list {
  display: flex;
  flex-direction: column;
}

.source-list label {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 2px;
  border-bottom: 1px solid #edf1f6;
}

.source-list label:last-child {
  border-bottom: 0;
}

.source-list label > div {
  min-width: 0;
  flex: 1;
}

.source-list strong,
.source-list span {
  display: block;
}

.source-list strong {
  color: #40536a;
  font-size: 8.5px;
  font-weight: 520;
}

.source-list span {
  margin-top: 2px;
  color: #97a2b1;
  font-size: 7px;
}

.source-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #8e9aaa;
  font-size: 7.5px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
}

.chapter-list > div {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 4px;
  border-bottom: 1px solid #edf1f6;
}

.chapter-list > div:last-child {
  border-bottom: 0;
}

.chapter-index {
  color: #a3b5c8;
  font-family: Georgia, serif;
  font-size: 10px;
}

.chapter-list strong {
  flex: 1;
  color: #4c5e75;
  font-size: 8.5px;
  font-weight: 520;
}

.generate-side {
  display: flex;
  position: sticky;
  top: 84px;
  flex-direction: column;
  gap: 14px;
}

.config-summary {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.config-summary > div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 9px;
}

.config-summary span {
  color: #8a96a7;
  font-size: 7.5px;
}

.config-summary strong {
  max-width: 165px;
  color: #40536a;
  font-size: 7.5px;
  font-weight: 550;
  text-align: right;
}

.generation-note {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  padding: 10px;
  margin: 12px 0;
  background: #f8fafc;
  border-radius: 6px;
}

.generation-note span {
  grid-column: span 2;
  color: #67798e;
  font-size: 7.5px;
  font-weight: 550;
}

.generation-note div {
  color: #8794a5;
  font-size: 7px;
}

.generate-button {
  width: 100%;
}

.generation-progress {
  margin-top: 9px;
}

.generation-rules {
  padding: 0 0 0 14px;
  margin: 0;
  color: #7a899d;
  font-size: 7.5px;
  line-height: 1.8;
}

.recent-template {
  padding: 8px 0;
  border-bottom: 1px solid #edf1f6;
}

.recent-template span,
.recent-template small {
  display: block;
}

.recent-template span {
  color: #475a71;
  font-size: 8px;
}

.recent-template small {
  margin-top: 2px;
  color: #9aa5b3;
  font-size: 6.5px;
}

@media (max-width: 1100px) {
  .generate-layout {
    grid-template-columns: 1fr;
  }

  .generate-side {
    position: static;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .template-grid {
    grid-template-columns: 1fr 1fr;
  }

  .generate-side {
    grid-template-columns: 1fr;
  }
}
</style>
