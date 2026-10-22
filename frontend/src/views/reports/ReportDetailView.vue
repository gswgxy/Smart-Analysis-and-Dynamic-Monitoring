<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  EditPen,
  Promotion,
  Share,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, evidence, reports, topicPreview } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const evidenceVisible = ref(false)

const report = computed(
  () => reports.find((item) => item.id === route.params.id) || reports[0],
)

const versions = [
  { version: 'V1.3', time: '2026-10-18 10:26', author: '张研', note: '补充风险提示与证据说明' },
  { version: 'V1.2', time: '2026-10-18 09:44', author: '张研', note: '更新产业营收数据' },
  { version: 'V1.1', time: '2026-10-17 18:32', author: '张研', note: '完成初稿生成' },
  { version: 'V1.0', time: '2026-10-17 16:10', author: '系统', note: '从分析结果生成初稿' },
]

async function submitReview() {
  try {
    await ElMessageBox.confirm('提交后将进入专家审核，审核期间内容将锁定，是否继续？', '提交审核', {
      confirmButtonText: '提交审核',
      cancelButtonText: '取消',
      type: 'info',
    })
    ElMessage.success('报告已提交专家审核')
    router.push('/reviews/workbench/REV-20261018-003')
  } catch {
    // 用户取消
  }
}

function exportReport() {
  ElMessage.success('PDF 导出任务已创建，可在导出中心查看')
  router.push('/reports/exports')
}
</script>

<template>
  <div class="page-shell">
    <div class="back-line">
      <el-button text :icon="ArrowLeft" @click="router.push('/reports')">返回报告管理</el-button>
      <span>{{ report.id }} · {{ report.version }}</span>
    </div>

    <PageHeader
      :title="topicPreview.title"
      :description="`${report.type} · ${report.industry} · 创建人 ${report.author}`"
      :data-version="dataVersion"
      :updated-at="report.updatedAt"
    >
      <template #badge>
        <StatusBadge :status="report.status" />
        <TrustBadge :level="report.trust" />
      </template>
      <template #actions>
        <el-button :icon="EditPen" @click="router.push(`/reports/editor/${report.id}`)">编辑</el-button>
        <el-button :icon="Download" @click="exportReport">导出</el-button>
        <el-button type="primary" :icon="Promotion" @click="submitReview">提交审核</el-button>
      </template>
    </PageHeader>

    <div class="detail-layout">
      <main class="report-document">
        <div class="document-head">
          <div class="document-org">北京市产业监测中心</div>
          <div class="document-confidential">内部资料 · 注意保密</div>
        </div>
        <h1>{{ topicPreview.title }}</h1>
        <div class="document-subtitle">北京市人工智能产业运行月报 · 2026 年第 10 期</div>
        <div class="document-meta">
          <span>报告编号 {{ report.id }}</span>
          <span>版本 {{ report.version }}</span>
          <span>数据版本 {{ dataVersion }}</span>
          <span>生成日期 2026-10-18</span>
        </div>

        <div class="document-summary">
          <span>摘要</span>
          <p>{{ topicPreview.summary }}</p>
        </div>

        <section v-for="(section, index) in topicPreview.sections" :key="section.title">
          <h2>{{ section.title }}</h2>
          <p>{{ section.content }}</p>
          <div v-if="index === 1" class="document-chart">
            <div class="chart-y-axis">
              <span>500</span><span>400</span><span>300</span><span>200</span>
            </div>
            <div class="chart-bars">
              <span v-for="height in [42, 49, 45, 55, 58, 63, 66, 72, 76, 84]" :key="height">
                <i :style="{ height: `${height}%` }" />
                <small>{{ ['11月','12月','1月','2月','3月','4月','5月','6月','7月','8月'][$index] }}</small>
              </span>
            </div>
          </div>
          <div v-if="index === 1" class="chart-caption">
            图 1：人工智能产业营业收入趋势（亿元） · 数据来源：产业监测指标库
          </div>
        </section>

        <div class="document-evidence-box">
          <div class="document-evidence-box__head">
            <strong>关键证据与可信度</strong>
            <button type="button" @click="evidenceVisible = true">查看全部 18 条</button>
          </div>
          <div class="document-evidence-list">
            <div v-for="(item, index) in evidence.slice(0, 3)" :key="item.id">
              <span>[{{ index + 1 }}]</span>
              <p>{{ item.title }}</p>
              <TrustBadge :level="item.trustLevel" :show-label="false" />
            </div>
          </div>
        </div>

        <div class="document-statement">
          <strong>结论声明</strong>
          <p>
            本报告基于 2026 年 10 月产业监测数据生成，部分融资数据存在 2 个工作日滞后。
            AI 芯片供应关系尚待企业侧确认，相关影响范围仅供研判参考。正式发布前须经专家审核。
          </p>
        </div>
      </main>

      <aside class="report-side">
        <DataCard title="报告状态" subtitle="流程与审核信息">
          <div class="status-flow">
            <div class="is-done"><span>1</span><div><strong>草稿完成</strong><small>10-18 10:26</small></div></div>
            <div class="is-done"><span>2</span><div><strong>已提交审核</strong><small>10-18 10:32</small></div></div>
            <div class="is-current"><span>3</span><div><strong>专家审核中</strong><small>预计 24 小时内完成</small></div></div>
            <div><span>4</span><div><strong>发布</strong><small>待审核通过</small></div></div>
          </div>
        </DataCard>

        <DataCard title="版本记录" subtitle="支持查看与对比历史版本">
          <div class="version-list">
            <button
              v-for="(item, index) in versions"
              :key="item.version"
              type="button"
              :class="{ 'is-current': index === 0 }"
            >
              <div><strong>{{ item.version }}</strong><small>{{ item.time }}</small></div>
              <span>{{ item.note }}</span>
            </button>
          </div>
          <template #footer>
            <el-button text size="small">版本对比</el-button>
            <el-button text size="small">恢复历史版本</el-button>
          </template>
        </DataCard>

        <DataCard title="报告信息" subtitle="元数据与发布范围">
          <div class="report-meta-list">
            <div><span>报告类型</span><strong>{{ report.type }}</strong></div>
            <div><span>所属产业</span><strong>{{ report.industry }}</strong></div>
            <div><span>创建人</span><strong>{{ report.author }}</strong></div>
            <div><span>证据数量</span><strong>18 条</strong></div>
            <div><span>图表数量</span><strong>8 个</strong></div>
            <div><span>发布范围</span><strong>内部授权用户</strong></div>
          </div>
        </DataCard>

        <DataCard title="分享与导出" subtitle="导出文件自动添加水印">
          <div class="share-actions">
            <el-button :icon="Share">复制分享链接</el-button>
            <el-button :icon="Download" @click="exportReport">导出 PDF</el-button>
          </div>
        </DataCard>
      </aside>
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="evidence" title="报告证据与来源" />
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

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  align-items: start;
  gap: 16px;
}

.report-document {
  min-height: 960px;
  padding: 48px clamp(34px, 6vw, 78px) 60px;
  background: #fff;
  border: 1px solid var(--dip-line);
  box-shadow: 0 8px 28px rgba(30, 55, 85, 0.07);
}

.document-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  color: #9aa5b2;
  border-bottom: 1px solid #dfe5ed;
  font-size: 7px;
  letter-spacing: 0.06em;
}

.report-document h1 {
  margin: 29px 0 8px;
  color: #1b3049;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 24px;
  font-weight: 650;
  line-height: 1.45;
  text-align: center;
}

.document-subtitle {
  color: #7b899b;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 9px;
  text-align: center;
}

.document-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px 16px;
  padding-bottom: 22px;
  margin-top: 10px;
  color: #98a3b1;
  border-bottom: 1px solid #e7ebf0;
  font-size: 7px;
}

.document-summary {
  padding: 13px 15px;
  margin: 24px 0;
  background: #f6f9fc;
  border-left: 3px solid #1769e0;
}

.document-summary span {
  color: #1769e0;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 9px;
  font-weight: 650;
}

.document-summary p {
  margin: 5px 0 0;
  color: #485b70;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 9px;
  line-height: 1.9;
}

.report-document section {
  margin-bottom: 23px;
}

.report-document section h2 {
  margin: 0 0 8px;
  color: #283d56;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 14px;
  font-weight: 650;
}

.report-document section p {
  margin: 0;
  color: #425469;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 10px;
  line-height: 2.05;
  text-align: justify;
  text-indent: 2em;
}

.document-chart {
  display: flex;
  height: 190px;
  gap: 8px;
  padding: 15px 10px 10px;
  margin: 14px 0 5px;
  background: #fafcfe;
  border: 1px solid #e8eef5;
}

.chart-y-axis {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  color: #9aa5b3;
  font-size: 6px;
}

.chart-bars {
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: space-around;
  gap: 10px;
  border-bottom: 1px solid #dfe6ef;
}

.chart-bars > span {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: flex-end;
  flex-direction: column;
  flex: 1;
}

.chart-bars i {
  width: 70%;
  background: linear-gradient(180deg, #4d96df, #1769e0);
  border-radius: 2px 2px 0 0;
}

.chart-bars small {
  margin-top: 4px;
  color: #9aa5b3;
  font-size: 5.5px;
}

.chart-caption {
  margin-bottom: 17px;
  color: #9aa5b3;
  font-size: 6.5px;
  text-align: center;
}

.document-evidence-box {
  padding: 13px;
  margin-top: 27px;
  background: #fafbfd;
  border: 1px solid #e7edf4;
  border-radius: 6px;
}

.document-evidence-box__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.document-evidence-box__head strong {
  color: #4b5e75;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 9px;
}

.document-evidence-box__head button {
  color: #1769e0;
  background: transparent;
  border: 0;
  font-size: 6.5px;
  cursor: pointer;
}

.document-evidence-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.document-evidence-list > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.document-evidence-list span {
  color: #8ea0b3;
  font-size: 6.5px;
}

.document-evidence-list p {
  overflow: hidden;
  flex: 1;
  margin: 0;
  color: #627288;
  font-size: 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-statement {
  padding: 11px 13px;
  margin-top: 20px;
  border: 1px solid #e7edf4;
}

.document-statement strong {
  color: #5b6d82;
  font-size: 7.5px;
}

.document-statement p {
  margin: 4px 0 0;
  color: #7b899a;
  font-size: 7px;
  line-height: 1.7;
}

.report-side {
  display: flex;
  position: sticky;
  top: 84px;
  flex-direction: column;
  gap: 14px;
}

.status-flow {
  display: flex;
  flex-direction: column;
}

.status-flow > div {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-bottom: 10px;
}

.status-flow > div > span {
  display: flex;
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #8e9aaa;
  background: #f1f4f8;
  border-radius: 50%;
  font-size: 6px;
}

.status-flow .is-done > span {
  color: #fff;
  background: #0ba58a;
}

.status-flow .is-current > span {
  color: #fff;
  background: #1769e0;
  box-shadow: 0 0 0 4px rgba(23, 105, 224, 0.08);
}

.status-flow strong,
.status-flow small {
  display: block;
}

.status-flow strong {
  color: #4b5d74;
  font-size: 7.5px;
  font-weight: 520;
}

.status-flow small {
  margin-top: 1px;
  color: #99a4b2;
  font-size: 6.5px;
}

.version-list {
  display: flex;
  flex-direction: column;
}

.version-list button {
  padding: 7px 0;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.version-list button.is-current strong {
  color: #1769e0;
}

.version-list button div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.version-list strong {
  color: #4b5e75;
  font-size: 7.5px;
  font-weight: 550;
}

.version-list small {
  color: #9aa5b3;
  font-size: 6.5px;
}

.version-list button > span {
  display: block;
  margin-top: 2px;
  color: #8d99a9;
  font-size: 6.5px;
}

.report-meta-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.report-meta-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.report-meta-list span {
  color: #8d99aa;
  font-size: 7px;
}

.report-meta-list strong {
  color: #465a71;
  font-size: 7px;
  font-weight: 520;
}

.share-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.share-actions .el-button {
  width: 100%;
  margin: 0;
}

@media (max-width: 1000px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .report-side {
    position: static;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 650px) {
  .report-document {
    padding: 28px 22px;
  }

  .report-side {
    grid-template-columns: 1fr;
  }
}
</style>
