<script setup lang="ts">
import {
  Check,
  CirclePlus,
  DocumentChecked,
  Picture,
  Promotion,
  Refresh,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, evidence, topicPreview } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const title = ref(topicPreview.title)
const activeSection = ref(0)
const saved = ref(true)
const previewMode = ref(false)

const sections = ref(
  topicPreview.sections.map((item) => ({
    title: item.title,
    content: item.content,
    evidenceCount: Math.floor(Math.random() * 4) + 3,
  })),
)

const active = computed(() => sections.value[activeSection.value])
const wordCount = computed(() => sections.value.reduce((sum, item) => sum + item.content.length, 0))

function markDirty() {
  saved.value = false
}

function saveDraft() {
  saved.value = true
  ElMessage.success('报告草稿已保存')
}

function insertChart() {
  active.value.content +=
    '\n\n[图表：人工智能产业营业收入与专利申请趋势，数据版本 V2026.10.18]'
  markDirty()
  ElMessage.success('已插入趋势图占位，编辑器中可替换图表')
}

function insertEvidence() {
  active.value.content += `\n\n[证据引用：${evidence[0].id} ${evidence[0].title}]`
  markDirty()
  ElMessage.success('已插入证据引用')
}

function submitReview() {
  ElMessage.success('报告已提交专家审核')
  router.push('/reviews/workbench/REV-20261018-003')
}
</script>

<template>
  <div class="editor-page">
    <header class="editor-top">
      <div class="editor-top__left">
        <el-button text @click="router.push('/reports')">报告管理</el-button>
        <span>/</span>
        <span>编辑报告</span>
        <StatusBadge status="DRAFT" />
      </div>
      <div class="editor-title">
        <el-input
          v-model="title"
          class="title-input"
          @input="markDirty"
        />
      </div>
      <div class="editor-actions">
        <span class="save-state"><i :class="{ 'is-dirty': !saved }" />{{ saved ? '已保存' : '有未保存修改' }}</span>
        <el-button :icon="Refresh" @click="saveDraft">保存草稿</el-button>
        <el-button :icon="Promotion" type="primary" @click="submitReview">提交审核</el-button>
      </div>
    </header>

    <div class="editor-shell">
      <aside class="outline-panel">
        <div class="outline-head">
          <strong>报告目录</strong>
          <el-button text size="small" :icon="CirclePlus">章节</el-button>
        </div>
        <button
          v-for="(section, index) in sections"
          :key="section.title"
          type="button"
          :class="{ 'is-active': activeSection === index }"
          @click="activeSection = index"
        >
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <div><strong>{{ section.title }}</strong><small>{{ section.evidenceCount }} 条证据</small></div>
        </button>
        <div class="outline-footer">
          <span>字数 {{ wordCount }}</span>
          <span>{{ sections.length }} 个章节</span>
        </div>
      </aside>

      <main class="editor-canvas">
        <div class="paper-toolbar">
          <div>
            <button type="button" @click="insertChart"><el-icon><Picture /></el-icon> 插入图表</button>
            <button type="button" @click="insertEvidence"><el-icon><DocumentChecked /></el-icon> 引用证据</button>
          </div>
          <el-radio-group v-model="previewMode" size="small">
            <el-radio-button :value="false">编辑</el-radio-button>
            <el-radio-button :value="true">预览</el-radio-button>
          </el-radio-group>
        </div>
        <article class="paper" :class="{ 'is-preview': previewMode }">
          <div class="paper-header">
            <span>北京市产业监测中心</span>
            <span>内部资料 · 注意保密</span>
          </div>
          <h1>{{ title }}</h1>
          <div class="paper-meta">
            <span>报告编号 RPT-20261018-001</span>
            <span>版本 V1.3</span>
            <span>数据版本 {{ dataVersion }}</span>
            <TrustBadge level="B" />
          </div>
          <section
            v-for="(section, index) in sections"
            :key="section.title"
            :class="{ 'is-active': activeSection === index }"
            @click="activeSection = index"
          >
            <h2>{{ section.title }}</h2>
            <template v-if="previewMode">
              <p>{{ section.content }}</p>
            </template>
            <el-input
              v-else
              v-model="section.content"
              type="textarea"
              autosize
              class="section-editor"
              @input="markDirty"
            />
            <div v-if="index === 0" class="inline-chart">
              <div class="inline-chart__head">
                <span>图 1 · 人工智能产业运行趋势</span>
                <button type="button">替换</button>
              </div>
              <div class="inline-chart__body">
                <span v-for="height in [32, 45, 39, 55, 61, 58, 72, 68, 77, 83]" :key="height" :style="{ height: `${height}%` }" />
              </div>
              <small>数据来源：产业监测指标库 · 数据版本 {{ dataVersion }}</small>
            </div>
          </section>
        </article>
      </main>

      <aside class="evidence-panel">
        <DataCard title="证据与来源" subtitle="当前章节引用">
          <div class="evidence-panel__summary">
            <span>已引用证据</span>
            <strong>18</strong>
            <em>A 级 6 · B 级 10 · C 级 2</em>
          </div>
          <div class="evidence-panel__list">
            <button
              v-for="item in evidence"
              :key="item.id"
              type="button"
              @click="ElMessage.info(`定位证据 ${item.id}`)"
            >
              <span>{{ item.sourceType }}</span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.trustLevel }} 级 · {{ item.publishedAt }}</small>
            </button>
          </div>
          <el-button size="small" plain class="add-evidence" :icon="CirclePlus">
            添加证据
          </el-button>
        </DataCard>

        <DataCard title="质量检查" subtitle="发布前自动检查">
          <div class="quality-list">
            <div class="is-pass"><el-icon><Check /></el-icon><span>图表数据版本一致</span></div>
            <div class="is-pass"><el-icon><Check /></el-icon><span>核心结论均已绑定证据</span></div>
            <div class="is-warn"><span>!</span><span>2 条证据为 C 级，需说明限制</span></div>
            <div class="is-pass"><el-icon><Check /></el-icon><span>数据来源与口径完整</span></div>
          </div>
        </DataCard>

        <DataCard title="版本记录" subtitle="自动保存与版本回溯">
          <div class="version-list">
            <div><span class="is-current" /><div><strong>V1.3 · 当前</strong><small>2026-10-18 10:26</small></div></div>
            <div><span /><div><strong>V1.2</strong><small>2026-10-18 09:44</small></div></div>
            <div><span /><div><strong>V1.1</strong><small>2026-10-17 18:32</small></div></div>
          </div>
        </DataCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.editor-page {
  display: flex;
  height: calc(100vh - 64px);
  min-height: 700px;
  flex-direction: column;
  background: #eef2f7;
}

.editor-top {
  display: grid;
  grid-template-columns: 1fr minmax(300px, 1.2fr) 1fr;
  align-items: center;
  gap: 16px;
  padding: 10px 18px;
  background: #fff;
  border-bottom: 1px solid #dfe6ef;
}

.editor-top__left {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8c98a8;
  font-size: 8px;
}

.editor-title {
  text-align: center;
}

.title-input :deep(.el-input__wrapper) {
  padding: 0;
  box-shadow: none;
}

.title-input :deep(.el-input__inner) {
  color: #293d55;
  font-size: 12px;
  font-weight: 580;
  text-align: center;
}

.editor-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.save-state {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 4px;
  color: #8e9aaa;
  font-size: 7px;
}

.save-state i {
  width: 5px;
  height: 5px;
  background: #0ba58a;
  border-radius: 50%;
}

.save-state i.is-dirty {
  background: #e5a11a;
}

.editor-shell {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 210px minmax(0, 1fr) 270px;
}

.outline-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #dfe6ef;
}

.outline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 14px;
  border-bottom: 1px solid #edf1f6;
}

.outline-head strong {
  color: #3b4e65;
  font-size: 9px;
  font-weight: 600;
}

.outline-panel > button {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 13px;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #f0f3f7;
  cursor: pointer;
}

.outline-panel > button:hover,
.outline-panel > button.is-active {
  background: #f4f8fd;
}

.outline-panel > button > span {
  color: #a3b5c8;
  font-family: Georgia, serif;
  font-size: 10px;
}

.outline-panel button div {
  min-width: 0;
}

.outline-panel button strong,
.outline-panel button small {
  display: block;
}

.outline-panel button strong {
  color: #4a5d74;
  font-size: 8px;
  font-weight: 520;
  line-height: 1.45;
}

.outline-panel button small {
  margin-top: 2px;
  color: #9aa5b3;
  font-size: 6.5px;
}

.outline-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  margin-top: auto;
  color: #9aa5b3;
  border-top: 1px solid #edf1f6;
  font-size: 6.5px;
}

.editor-canvas {
  min-width: 0;
  overflow-y: auto;
  background:
    radial-gradient(circle at 50% 0%, rgba(23, 105, 224, 0.035), transparent 30%),
    #eef2f7;
}

.paper-toolbar {
  position: sticky;
  z-index: 3;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #dfe6ef;
  backdrop-filter: blur(8px);
}

.paper-toolbar > div {
  display: flex;
  gap: 5px;
}

.paper-toolbar button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 7px;
  color: #5d7087;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 7.5px;
  cursor: pointer;
}

.paper-toolbar button:hover {
  background: #f3f7fb;
  border-color: #e2e9f1;
}

.paper {
  width: min(760px, calc(100% - 36px));
  min-height: 900px;
  padding: 48px 58px 60px;
  margin: 18px auto 40px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(28, 54, 83, 0.09);
}

.paper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  color: #9ba5b2;
  border-bottom: 1px solid #dfe5ed;
  font-size: 7px;
  letter-spacing: 0.06em;
}

.paper h1 {
  margin: 24px 0 11px;
  color: #1b3049;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.45;
  text-align: center;
}

.paper-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 7px 14px;
  margin-bottom: 30px;
  color: #8d99a9;
  font-size: 7px;
}

.paper section {
  padding: 9px;
  margin: 0 -9px 18px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.paper section:hover,
.paper section.is-active {
  border-color: #e3ebf5;
}

.paper section h2 {
  margin: 0 0 8px;
  color: #2b4059;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 13px;
  font-weight: 650;
}

.paper section p {
  margin: 0;
  color: #46586d;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 10px;
  line-height: 2;
  text-align: justify;
}

.section-editor :deep(.el-textarea__inner) {
  padding: 0;
  color: #46586d;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 10px;
  line-height: 2;
  background: transparent;
  border: 0;
  box-shadow: none;
  resize: none;
}

.inline-chart {
  padding: 10px;
  margin-top: 10px;
  background: #fafcfe;
  border: 1px solid #e8eef5;
  border-radius: 5px;
}

.inline-chart__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5f7085;
  font-size: 7.5px;
}

.inline-chart__head button {
  color: #1769e0;
  background: transparent;
  border: 0;
  font-size: 6.5px;
  cursor: pointer;
}

.inline-chart__body {
  display: flex;
  height: 90px;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 5px 0;
}

.inline-chart__body span {
  flex: 1;
  background: linear-gradient(180deg, #5da2e6, #1769e0);
  border-radius: 2px 2px 0 0;
  opacity: 0.8;
}

.inline-chart small {
  display: block;
  margin-top: 8px;
  color: #9aa5b3;
  font-size: 6px;
  text-align: right;
}

.evidence-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 13px;
  padding: 13px;
  overflow-y: auto;
  background: #f5f7fa;
  border-left: 1px solid #dfe6ef;
}

.evidence-panel :deep(.data-card__body) {
  padding: 12px;
}

.evidence-panel__summary {
  text-align: center;
}

.evidence-panel__summary span,
.evidence-panel__summary strong,
.evidence-panel__summary em {
  display: block;
}

.evidence-panel__summary span {
  color: #8895a6;
  font-size: 7px;
}

.evidence-panel__summary strong {
  margin: 2px 0;
  color: #1769e0;
  font-family: Georgia, serif;
  font-size: 27px;
  font-weight: 500;
}

.evidence-panel__summary em {
  color: #98a3b1;
  font-size: 6.5px;
  font-style: normal;
}

.evidence-panel__list {
  display: flex;
  flex-direction: column;
  margin-top: 9px;
}

.evidence-panel__list button {
  padding: 8px 0;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.evidence-panel__list span {
  padding: 1px 4px;
  color: #5d7792;
  background: #eff4f9;
  border-radius: 3px;
  font-size: 6px;
}

.evidence-panel__list strong,
.evidence-panel__list small {
  display: block;
}

.evidence-panel__list strong {
  overflow: hidden;
  margin-top: 4px;
  color: #43566e;
  font-size: 7px;
  font-weight: 520;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.evidence-panel__list small {
  margin-top: 2px;
  color: #9aa5b3;
  font-size: 6px;
}

.add-evidence {
  width: 100%;
  margin-top: 8px;
}

.quality-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.quality-list > div {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6f8094;
  font-size: 7px;
}

.quality-list .is-pass .el-icon {
  color: #0ba58a;
}

.quality-list .is-warn {
  color: #a77926;
}

.quality-list .is-warn > span:first-child {
  display: flex;
  width: 11px;
  height: 11px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #e5a11a;
  border-radius: 50%;
  font-size: 6px;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.version-list > div {
  display: flex;
  align-items: flex-start;
  gap: 7px;
}

.version-list > div > span {
  width: 5px;
  height: 5px;
  margin-top: 3px;
  background: #bdc9d7;
  border-radius: 50%;
}

.version-list > div > span.is-current {
  background: #0ba58a;
}

.version-list strong,
.version-list small {
  display: block;
}

.version-list strong {
  color: #4a5c73;
  font-size: 7px;
  font-weight: 520;
}

.version-list small {
  margin-top: 1px;
  color: #9ba5b3;
  font-size: 6px;
}

@media (max-width: 1100px) {
  .editor-page {
    height: auto;
    min-height: calc(100vh - 64px);
  }

  .editor-shell {
    grid-template-columns: 180px minmax(0, 1fr);
  }

  .evidence-panel {
    display: none;
  }
}

@media (max-width: 760px) {
  .editor-top {
    grid-template-columns: 1fr;
  }

  .editor-shell {
    grid-template-columns: 1fr;
  }

  .outline-panel {
    display: none;
  }

  .paper {
    width: calc(100% - 20px);
    padding: 28px 24px;
  }
}
</style>
