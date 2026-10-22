<script setup lang="ts">
import {
  CopyDocument,
  DocumentChecked,
  Link,
  Search,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, evidence, updatedAt } from '@/mock/data'

const router = useRouter()
const selectedId = ref(evidence[0].id)
const type = ref('全部类型')
const keyword = ref('')

const filteredEvidence = computed(() =>
  evidence.filter((item) => {
    const typeMatch = type.value === '全部类型' || item.sourceType === type.value
    const query = keyword.value.trim()
    const keywordMatch = !query || item.title.includes(query) || item.snippet.includes(query)
    return typeMatch && keywordMatch
  }),
)

const selected = computed(
  () => evidence.find((item) => item.id === selectedId.value) || evidence[0],
)

async function copyCitation() {
  const citation = `${selected.value.title}，${selected.value.source}，${selected.value.publishedAt}，证据编号：${selected.value.id}`
  try {
    await navigator.clipboard.writeText(citation)
    ElMessage.success('引用格式已复制')
  } catch {
    ElMessage.info(citation)
  }
}

async function feedback() {
  try {
    const { value } = await ElMessageBox.prompt(
      '请说明证据内容、来源或定位存在的问题',
      '证据纠错',
      {
        confirmButtonText: '提交反馈',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '例如：原文定位偏移，或证据与结论存在不一致。',
      },
    )
    if (value) ElMessage.success('反馈已提交，将进入证据复核流程')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="证据中心"
      description="汇集分析结论关联的政策、指标、图谱、风险与企业证据，支持原文定位、引用复制和纠错反馈。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="CopyDocument" @click="copyCitation">复制引用</el-button>
        <el-button type="primary" :icon="Warning" @click="feedback">证据纠错</el-button>
      </template>
    </PageHeader>

    <FilterBar label="证据筛选">
      <el-select v-model="type" style="width: 130px">
        <el-option label="全部类型" value="全部类型" />
        <el-option label="政策" value="政策" />
        <el-option label="指标" value="指标" />
        <el-option label="图谱" value="图谱" />
        <el-option label="风险事件" value="风险事件" />
      </el-select>
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        placeholder="搜索证据标题或正文片段"
        clearable
        style="width: 260px"
      />
      <el-date-picker model-value="近30天" type="daterange" style="width: 210px" />
      <template #extra>
        <span class="status-line">共 {{ filteredEvidence.length }} 条证据</span>
      </template>
    </FilterBar>

    <div class="evidence-layout">
      <aside class="evidence-list-panel">
        <div class="evidence-list-panel__head">
          <strong>证据列表</strong>
          <span>按可信度与时间排序</span>
        </div>
        <button
          v-for="item in filteredEvidence"
          :key="item.id"
          type="button"
          :class="{ 'is-active': selectedId === item.id }"
          @click="selectedId = item.id"
        >
          <div class="evidence-list-item__top">
            <span>{{ item.sourceType }}</span>
            <TrustBadge :level="item.trustLevel" :show-label="false" />
          </div>
          <strong>{{ item.title }}</strong>
          <p>{{ item.snippet }}</p>
          <div class="evidence-list-item__meta">
            <span>{{ item.source }}</span>
            <time>{{ item.publishedAt }}</time>
          </div>
        </button>
        <div v-if="!filteredEvidence.length" class="empty-evidence">没有匹配的证据</div>
      </aside>

      <div class="evidence-detail">
        <DataCard
          :title="selected.title"
          :subtitle="`${selected.sourceType} · ${selected.source} · ${selected.publishedAt}`"
        >
          <template #actions>
            <TrustBadge :level="selected.trustLevel" />
          </template>
          <div class="source-preview">
            <div class="source-preview__head">
              <div class="source-doc-icon">
                <el-icon><DocumentChecked /></el-icon>
              </div>
              <div>
                <strong>{{ selected.title }}</strong>
                <span>{{ selected.source }} · 原文预览</span>
              </div>
              <el-button size="small" :icon="Link">打开原文</el-button>
            </div>
            <div class="source-preview__body">
              <div class="fake-paragraph" />
              <div class="fake-paragraph is-short" />
              <p class="evidence-highlight">{{ selected.snippet }}</p>
              <div class="fake-paragraph" />
              <div class="fake-paragraph" />
              <div class="fake-paragraph is-short" />
            </div>
            <div class="source-preview__footer">
              <span>原文定位：第 2 页 · 第 3 段</span>
              <span>内容指纹 SHA256: 9f3a…c821</span>
            </div>
          </div>
        </DataCard>

        <div class="evidence-detail-grid">
          <DataCard title="证据元数据" subtitle="可追溯的采集与校验信息">
            <div class="metadata-list">
              <div><span>证据编号</span><strong class="mono">{{ selected.id }}</strong></div>
              <div><span>来源类型</span><strong>{{ selected.sourceType }}</strong></div>
              <div><span>发布机构</span><strong>{{ selected.source }}</strong></div>
              <div><span>发布时间</span><strong>{{ selected.publishedAt }}</strong></div>
              <div><span>采集时间</span><strong>2026-10-18 06:12</strong></div>
              <div><span>访问权限</span><strong>授权用户可见</strong></div>
            </div>
          </DataCard>
          <DataCard title="关联结论" subtitle="引用该证据的分析结论">
            <div class="claims-list">
              <button type="button" @click="router.push('/analysis/qa')">
                <span>产业运行分析</span>
                <strong>人工智能产业规模同比增长 12.4%</strong>
                <small>可信度 B · 引用 1 次</small>
              </button>
              <button type="button" @click="router.push('/analysis/risk')">
                <span>风险研判</span>
                <strong>AI 芯片供应集中度上升影响算力扩容</strong>
                <small>可信度 B · 引用 2 次</small>
              </button>
            </div>
          </DataCard>
        </div>
      </div>
    </div>

    <div class="evidence-note">
      <el-icon><Warning /></el-icon>
      原始来源访问会记录用户、时间与数据范围；证据纠错不会直接修改正式结论，需经审核后生效。
    </div>
  </div>
</template>

<style scoped>
.evidence-layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  align-items: start;
  gap: 16px;
}

.evidence-list-panel {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.evidence-list-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 15px;
  border-bottom: 1px solid #edf1f6;
}

.evidence-list-panel__head strong {
  color: #354960;
  font-size: 10px;
  font-weight: 600;
}

.evidence-list-panel__head span {
  color: #96a1b0;
  font-size: 7px;
}

.evidence-list-panel > button {
  display: block;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  background: #fff;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.evidence-list-panel > button:hover,
.evidence-list-panel > button.is-active {
  background: #f5f9fe;
}

.evidence-list-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.evidence-list-item__top > span {
  padding: 2px 5px;
  color: #5e7894;
  background: #eef4f9;
  border-radius: 3px;
  font-size: 6.5px;
}

.evidence-list-panel button > strong {
  display: -webkit-box;
  overflow: hidden;
  margin: 6px 0 4px;
  color: #3b4e66;
  font-size: 8.5px;
  font-weight: 550;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.evidence-list-panel button > p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #8390a2;
  font-size: 7px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.evidence-list-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  color: #9ba5b3;
  font-size: 6.5px;
}

.empty-evidence {
  padding: 40px;
  color: #98a3b1;
  font-size: 8px;
  text-align: center;
}

.evidence-detail {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.source-preview {
  overflow: hidden;
  background: #fdfefe;
  border: 1px solid #e3eaf2;
  border-radius: 8px;
}

.source-preview__head {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 13px;
  background: #f7fafc;
  border-bottom: 1px solid #e8eef5;
}

.source-doc-icon {
  display: flex;
  width: 29px;
  height: 29px;
  align-items: center;
  justify-content: center;
  color: #507ba5;
  background: #e9f1f9;
  border-radius: 6px;
}

.source-preview__head > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.source-preview__head strong,
.source-preview__head span {
  display: block;
}

.source-preview__head strong {
  color: #40536a;
  font-size: 8.5px;
  font-weight: 550;
}

.source-preview__head span {
  margin-top: 2px;
  color: #96a1b0;
  font-size: 6.5px;
}

.source-preview__body {
  padding: 22px 26px;
}

.fake-paragraph {
  width: 100%;
  height: 5px;
  margin: 8px 0;
  background: #edf1f5;
  border-radius: 4px;
}

.fake-paragraph.is-short {
  width: 67%;
}

.evidence-highlight {
  padding: 11px 13px;
  margin: 15px 0;
  color: #4b5e75;
  background: #fff9e8;
  border-left: 3px solid #dfa52e;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 9px;
  line-height: 1.9;
}

.source-preview__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 13px;
  color: #99a4b2;
  background: #fafbfd;
  border-top: 1px solid #edf1f6;
  font-size: 6.5px;
}

.evidence-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metadata-list {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1px;
  overflow: hidden;
  background: #e8eef5;
  border: 1px solid #e8eef5;
  border-radius: 7px;
}

.metadata-list > div {
  display: contents;
}

.metadata-list span,
.metadata-list strong {
  padding: 8px;
  background: #fafbfd;
  font-size: 7px;
}

.metadata-list span {
  color: #8a96a7;
}

.metadata-list strong {
  color: #475a71;
  font-weight: 520;
}

.claims-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.claims-list button {
  padding: 9px;
  text-align: left;
  background: #f9fbfd;
  border: 1px solid #e8eef5;
  border-radius: 6px;
  cursor: pointer;
}

.claims-list span {
  padding: 1px 4px;
  color: #5f7894;
  background: #edf3f9;
  border-radius: 3px;
  font-size: 6.5px;
}

.claims-list strong,
.claims-list small {
  display: block;
}

.claims-list strong {
  margin-top: 5px;
  color: #40536a;
  font-size: 8px;
  font-weight: 520;
}

.claims-list small {
  margin-top: 2px;
  color: #99a4b2;
  font-size: 6.5px;
}

.evidence-note {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8e7954;
  font-size: 7.5px;
}

@media (max-width: 1020px) {
  .evidence-layout {
    grid-template-columns: 1fr;
  }

  .evidence-list-panel {
    max-height: 400px;
    overflow-y: auto;
  }
}

@media (max-width: 700px) {
  .evidence-detail-grid {
    grid-template-columns: 1fr;
  }

  .source-preview__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
